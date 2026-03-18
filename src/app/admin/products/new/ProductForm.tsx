"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProduct } from "./actions";
import { Plus, Trash, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Schema (matching server)
const formSchema = z.object({
  name: z.string().min(2, "Required"),
  slug: z.string().min(2, "Required"),
  description: z.string().min(10, "Required (min 10 chars)"),
  price: z.coerce.number().min(1, "Must be > 0"),
  comparePrice: z.coerce.number().nullable().optional(),
  categoryId: z.string().min(1, "Select category"),
  brand: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url("Must be valid URL")).min(1, "Add at least 1 image URL"),
  variants: z.array(z.object({
    size: z.string().min(1, "Size required"),
    stock: z.coerce.number().min(0, "Stock >= 0"),
    sku: z.string().min(1, "SKU required"),
  })).min(1, "Add at least 1 size variant"),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFeatured: false,
      isActive: true,
      images: [""],
      variants: [{ size: "ONE SIZE", stock: 10, sku: "" }],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images" as never,
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const productName = watch("name");

  // Auto-generate slug and SKU based on name 
  const generateSlug = () => {
    if (productName) {
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue("slug", slug, { shouldValidate: true });
      
      // Also set the first SKU if empty
      const currentVariants = watch("variants");
      if (currentVariants.length > 0 && !currentVariants[0].sku) {
        setValue(`variants.0.sku`, `${slug.toUpperCase().substring(0, 8)}-${currentVariants[0].size.substring(0, 2)}`);
      }
    }
  };

  async function onSubmit(data: FormValues) {
    // Filter out empty images
    data.images = data.images.filter(url => url.trim() !== "");
    if (data.images.length === 0) {
      toast.error("Please provide at least one valid image URL");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProduct(data);
      if (result.success) {
        toast.success("Product created successfully!");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-sand p-6">
            <h2 className="font-display text-lg font-medium mb-4">Basic Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Product Name *</label>
                <div className="flex gap-2">
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-3 py-2 border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={generateSlug}
                    className="px-3 py-2 bg-sand text-charcoal text-xs shrink-0 hover:bg-brand-600 hover:text-white transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">URL Slug *</label>
                <input
                  {...register("slug")}
                  type="text"
                  className="w-full px-3 py-2 border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                  placeholder="e.g. nairobi-summer-dress"
                />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors resize-y"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white border border-sand p-6">
            <h2 className="font-display text-lg font-medium mb-4">Pricing & Category</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Price (KES) *</label>
                <input
                  {...register("price")}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Compare at Price (KES)</label>
                <input
                  {...register("comparePrice")}
                  type="number"
                  min="0"
                  placeholder="Optional retail price"
                  className="w-full px-3 py-2 border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-1">Category *</label>
                <select
                  {...register("categoryId")}
                  className="w-full px-3 py-2 border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white border border-sand p-6">
            <h2 className="font-display text-lg font-medium mb-4">Inventory Variants (Sizes)</h2>
            
            <div className="space-y-4">
              {variantFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 p-4 border border-sand bg-gray-50/50">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">Size (e.g. S, M, XL) *</label>
                        <input
                          {...register(`variants.${index}.size`)}
                          type="text"
                          className="w-full px-3 py-1.5 text-sm border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                        />
                        {errors.variants?.[index]?.size && <p className="text-red-500 text-[10px] mt-1">{errors.variants[index]?.size?.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">Stock Quantity *</label>
                        <input
                          {...register(`variants.${index}.stock`)}
                          type="number"
                          min="0"
                          className="w-full px-3 py-1.5 text-sm border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                        />
                        {errors.variants?.[index]?.stock && <p className="text-red-500 text-[10px] mt-1">{errors.variants[index]?.stock?.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">SKU (Stock Keeping Unit) *</label>
                      <input
                        {...register(`variants.${index}.sku`)}
                        type="text"
                        placeholder="e.g. DRESS-S-01"
                        className="w-full px-3 py-1.5 text-sm border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                      />
                      {errors.variants?.[index]?.sku && <p className="text-red-500 text-[10px] mt-1">{errors.variants[index]?.sku?.message}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    disabled={variantFields.length === 1}
                    className="p-2 text-muted hover:text-red-600 disabled:opacity-30 mt-5 transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => appendVariant({ size: "", stock: 0, sku: "" })}
                className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:text-brand-700 transition-colors"
              >
                <Plus size={14} /> Add Another Variant
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Media & Extra Settings */}
        <div className="space-y-6">
          <div className="bg-white border border-sand p-6">
            <h2 className="font-display text-lg font-medium mb-4 flex items-center gap-2">
              <ImageIcon size={18} className="text-muted" /> Media
            </h2>
            <div className="space-y-4">
              <p className="text-xs text-muted">Paste absolute image URLs (e.g. Unsplash or Cloudinary) for the product gallery. The first image will be the main thumbnail.</p>
              
              {imageFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      {...register(`images.${index}` as never)}
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-sm border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                    />
                    {/* @ts-ignore - complex nested array error typing */}
                    {errors.images?.[index] && <p className="text-red-500 text-xs mt-1">{errors.images[index]?.message}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={imageFields.length === 1}
                    className="p-2 text-muted hover:text-red-600 disabled:opacity-30 self-start transition-colors border border-transparent hover:border-sand"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => appendImage("")}
                className="text-sm text-brand-600 font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add Image URL
              </button>
            </div>
          </div>

          <div className="bg-white border border-sand p-6">
            <h2 className="font-display text-lg font-medium mb-4">Publishing</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  className="w-4 h-4 text-brand-600 border-sand rounded focus:ring-brand-600"
                />
                <div>
                  <p className="text-sm font-medium text-charcoal">Active Status</p>
                  <p className="text-xs text-muted">Product will be visible to customers</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register("isFeatured")}
                  type="checkbox"
                  className="w-4 h-4 text-brand-600 border-sand rounded focus:ring-brand-600"
                />
                <div>
                  <p className="text-sm font-medium text-charcoal">Featured Product</p>
                  <p className="text-xs text-muted">Showcase this item on the homepage</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white border border-sand p-6">
            <h2 className="font-display text-lg font-medium mb-4">Specs (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Brand</label>
                <input
                  {...register("brand")}
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Material</label>
                <input
                  {...register("material")}
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-sand focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-sand pt-6 mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary min-w-[140px]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Saving...
            </span>
          ) : (
            "Save Product"
          )}
        </button>
      </div>
    </form>
  );
}

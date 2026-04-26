import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { menuData } from '@/data/menu';

export async function GET() {
  try {
    let insertedCategories = 0;
    let insertedSubcategories = 0;
    let insertedProducts = 0;

    for (let cIndex = 0; cIndex < menuData.length; cIndex++) {
      const category = menuData[cIndex];
      
      // Insert category
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .insert({ name: category.name, sort_order: cIndex })
        .select()
        .single();
        
      if (catError) throw catError;
      insertedCategories++;

      // Handle direct items
      if (category.items && category.items.length > 0) {
        for (let pIndex = 0; pIndex < category.items.length; pIndex++) {
          const item = category.items[pIndex];
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .insert({
              category_id: catData.id,
              name: item.name,
              description: item.description || null,
              price: item.price || 0,
              image_url: item.imageUrl || null,
              sort_order: pIndex
            })
            .select()
            .single();
            
          if (prodError) throw prodError;
          insertedProducts++;

          // Handle variants
          if (item.variants && item.variants.length > 0) {
            const variantsToInsert = item.variants.map((v, vIndex) => ({
              product_id: prodData.id,
              name: v.name,
              price: v.price,
              sort_order: vIndex
            }));
            const { error: varError } = await supabase.from('product_variants').insert(variantsToInsert);
            if (varError) throw varError;
          }
        }
      }

      // Handle subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        for (let sIndex = 0; sIndex < category.subcategories.length; sIndex++) {
          const sub = category.subcategories[sIndex];
          
          const { data: subData, error: subError } = await supabase
            .from('subcategories')
            .insert({ category_id: catData.id, name: sub.name, sort_order: sIndex })
            .select()
            .single();
            
          if (subError) throw subError;
          insertedSubcategories++;

          for (let pIndex = 0; pIndex < sub.items.length; pIndex++) {
            const item = sub.items[pIndex];
            const { data: prodData, error: prodError } = await supabase
              .from('products')
              .insert({
                category_id: catData.id,
                subcategory_id: subData.id,
                name: item.name,
                description: item.description || null,
                price: item.price || 0,
                image_url: item.imageUrl || null,
                sort_order: pIndex
              })
              .select()
              .single();
              
            if (prodError) throw prodError;
            insertedProducts++;

            // Handle variants
            if (item.variants && item.variants.length > 0) {
              const variantsToInsert = item.variants.map((v, vIndex) => ({
                product_id: prodData.id,
                name: v.name,
                price: v.price,
                sort_order: vIndex
              }));
              const { error: varError } = await supabase.from('product_variants').insert(variantsToInsert);
              if (varError) throw varError;
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cardápio migrado com sucesso!',
      stats: { insertedCategories, insertedSubcategories, insertedProducts }
    });
  } catch (error: any) {
    console.error('Erro no seed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

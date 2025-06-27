import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/appContext'
import ProductCard from '../components/ProductCard';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';

const ProductCategory = () => {
    const {products} = useAppContext();
    const {category} = useParams();
    const searchCategory = categories.find((item)=>item.path.toLowerCase() === category)
    const filteredProducts = products.filter((product)=>product.category.toLowerCase()===category)

  return (
    <div>{
        searchCategory &&(
            <div className='mt-16 flex flex-col'>
                <div className='flex flex-col items-end w-max'>
                    <p className='text-2xl font-medium uppercase'>{searchCategory.text}</p>
                    <div className='w-16 h-0.5 bg-primary rounded-full'></div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mt-6 w-full max-w-screen-xl mx-auto justify-items-center'>
                    {(filteredProducts.length > 0)?
                        (
                            <>
                                {filteredProducts.filter((product) => product.inStock).map((product, index) => (
                                    <ProductCard key={index} product={product} />
                                ))}
                            </>
                        )
                        :
                        (
                            <div className='flex items-center justify-center h-[60vh]'>
                                <p className="text-2xl font-medium text-primary">No Products found in this category.</p>
                            </div>
                        )
                    }
                </div>
            </div>
        )}
    </div>
    

  )
}

export default ProductCategory

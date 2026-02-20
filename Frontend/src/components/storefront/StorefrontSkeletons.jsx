import React from 'react';
import Skeleton from '../ui/Skeleton';
import './StorefrontSkeletons.css';

export const ProductCardSkeleton = () => (
    <div className="product-card-skeleton">
        <div className="skeleton-image-wrapper">
            <Skeleton height="200px" borderRadius="12px" />
        </div>
        <div className="skeleton-info">
            <Skeleton width="60%" height="24px" className="mb-2" />
            <Skeleton width="40%" height="20px" />
        </div>
        <div className="skeleton-button">
            <Skeleton height="40px" borderRadius="8px" />
        </div>
    </div>
);

export const CategoryCardSkeleton = () => (
    <div className="category-card-skeleton">
        <div className="skeleton-image-wrapper">
            <Skeleton height="200px" borderRadius="12px" />
        </div>
        <div className="skeleton-info">
            <Skeleton width="50%" height="24px" className="mb-2" />
            <Skeleton width="90%" height="16px" className="mb-1" />
            <Skeleton width="80%" height="16px" />
        </div>
    </div>
);

export const NavbarSkeleton = () => (
    <div className="navbar-skeleton">
        <div className="container">
            <div className="navbar-content">
                <Skeleton width="120px" height="32px" />
                <div className="navbar-links-skeleton">
                    <Skeleton width="60px" height="20px" />
                    <Skeleton width="60px" height="20px" />
                    <Skeleton width="60px" height="20px" />
                </div>
            </div>
        </div>
    </div>
);

export const ProductsPageSkeleton = () => (
    <div className="page-skeleton">
        <NavbarSkeleton />
        <main className="main-skeleton">
            <div className="container">
                <div className="controls-skeleton">
                    <Skeleton width="100%" height="48px" borderRadius="8px" className="search-skele" />
                    <Skeleton width="180px" height="48px" borderRadius="8px" className="sort-skele" />
                </div>
                <div className="grid-skeleton">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </main>
    </div>
);

export const CategoriesPageSkeleton = () => (
    <div className="page-skeleton">
        <NavbarSkeleton />
        <main className="main-skeleton">
            <div className="container">
                <div className="header-skeleton">
                    <Skeleton width="200px" height="48px" className="mb-4" />
                    <Skeleton width="300px" height="24px" />
                </div>
                <div className="grid-skeleton">
                    {[1, 2, 3].map((i) => (
                        <CategoryCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </main>
    </div>
);

export const ProductDetailSkeleton = () => (
    <div className="page-skeleton">
        <div className="container">
            <Skeleton width="120px" height="24px" className="mb-8 mt-4" />
            <div className="detail-layout-skeleton">
                <div className="detail-gallery-skeleton">
                    <Skeleton height="500px" borderRadius="12px" />
                </div>
                <div className="detail-info-skeleton">
                    <Skeleton width="80%" height="48px" className="mb-4" />
                    <Skeleton width="30%" height="32px" className="mb-8" />

                    <div className="mb-8">
                        <Skeleton width="120px" height="24px" className="mb-4" />
                        <Skeleton width="100%" height="16px" className="mb-2" />
                        <Skeleton width="100%" height="16px" className="mb-2" />
                        <Skeleton width="80%" height="16px" />
                    </div>

                    <div className="mb-8">
                        <Skeleton width="150px" height="24px" className="mb-2" />
                        <Skeleton width="130px" height="24px" />
                    </div>

                    <Skeleton height="56px" borderRadius="12px" />
                </div>
            </div>
        </div>
    </div>
);

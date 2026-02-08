import React from 'react';
import Skeleton from './Skeleton';
import './PageLoader.css';

/**
 * Reusable page-level skeleton loader for dashboard pages
 * @param {string} type - 'table' | 'cards' | 'form' | 'list'
 */
const PageLoader = ({ type = 'table' }) => {
    if (type === 'table') {
        return (
            <div className="page-loader">
                <div className="page-loader-header">
                    <Skeleton width="200px" height="32px" borderRadius="8px" />
                    <Skeleton width="120px" height="40px" borderRadius="8px" />
                </div>
                <div className="page-loader-table">
                    <div className="table-header-skeleton">
                        <Skeleton width="100%" height="48px" borderRadius="8px" />
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="table-row-skeleton">
                            <Skeleton width="100%" height="60px" borderRadius="8px" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'cards') {
        return (
            <div className="page-loader">
                <div className="page-loader-header">
                    <Skeleton width="200px" height="32px" borderRadius="8px" />
                    <Skeleton width="120px" height="40px" borderRadius="8px" />
                </div>
                <div className="page-loader-cards">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card-skeleton">
                            <Skeleton height="160px" borderRadius="12px" />
                            <Skeleton width="80%" height="24px" borderRadius="6px" className="mt-3" />
                            <Skeleton width="50%" height="20px" borderRadius="6px" className="mt-2" />
                            <Skeleton width="100%" height="36px" borderRadius="8px" className="mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="page-loader">
                <div className="page-loader-header">
                    <Skeleton width="200px" height="32px" borderRadius="8px" />
                </div>
                <div className="page-loader-list">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="list-item-skeleton">
                            <Skeleton width="48px" height="48px" borderRadius="12px" />
                            <div className="list-item-text">
                                <Skeleton width="70%" height="20px" borderRadius="6px" />
                                <Skeleton width="40%" height="16px" borderRadius="4px" className="mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Default form skeleton
    return (
        <div className="page-loader">
            <Skeleton width="250px" height="36px" borderRadius="8px" className="mb-6" />
            <div className="page-loader-form">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="form-field-skeleton">
                        <Skeleton width="100px" height="16px" borderRadius="4px" />
                        <Skeleton width="100%" height="44px" borderRadius="8px" className="mt-2" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageLoader;

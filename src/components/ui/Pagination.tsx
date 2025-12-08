import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    onRowsPerPageChange(newRowsPerPage);
    // Reset to first page when changing rows per page
    onPageChange(1);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
      {/* Rows per page selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="rows-per-page" className="text-sm text-gray-700 whitespace-nowrap">
          Rows per page:
        </label>
        <select
          id="rows-per-page"
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Page info and navigation */}
      <div className="flex items-center gap-4">
        {/* Page info */}
        <span className="text-sm text-gray-700 whitespace-nowrap">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </span>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            aria-label="First page"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* Previous page */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* Next page */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          {/* Last page */}
          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            aria-label="Last page"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

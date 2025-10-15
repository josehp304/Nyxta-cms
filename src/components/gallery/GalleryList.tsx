import { useEffect, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Filter, X } from 'lucide-react';
import { galleryService, branchService, imageService } from '../../services/api';
import type { Gallery, Branch } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import ConfirmDialog from '../ConfirmDialog';

const GalleryList = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; gallery: Gallery | null }>({
    isOpen: false,
    gallery: null,
  });

  // Upload form state
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    branchId: '',
    title: '',
    tags: '',
    displayOrder: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedBranch]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [galleryData, branchData] = await Promise.all([
        galleryService.getAll(selectedBranch || undefined),
        branchService.getAll(),
      ]);
      setGalleries(galleryData);
      setBranches(branchData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.branchId) return;

    try {
      setUploading(true);
      setError(null);

      const tags = uploadData.tags ? uploadData.tags.split(',').map(t => t.trim()) : [];
      const displayOrder = uploadData.displayOrder ? parseInt(uploadData.displayOrder) : undefined;

      const newGallery = await galleryService.uploadAndCreate(
        uploadData.file,
        parseInt(uploadData.branchId),
        uploadData.title || undefined,
        tags.length > 0 ? tags : undefined,
        displayOrder
      );

      setGalleries([...galleries, newGallery]);
      setShowUploadModal(false);
      setUploadData({ file: null, branchId: '', title: '', tags: '', displayOrder: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.gallery) return;

    try {
      // Delete from database
      await galleryService.delete(deleteDialog.gallery.id);
      
      // Try to delete from ImageHippo (optional, might fail if image doesn't exist)
      try {
        await imageService.deleteImage(deleteDialog.gallery.image_url);
      } catch {
        // Ignore ImageHippo delete errors
      }

      setGalleries(galleries.filter((g) => g.id !== deleteDialog.gallery!.id));
      setDeleteDialog({ isOpen: false, gallery: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  if (loading) return <LoadingSpinner message="Loading gallery..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Image</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Filter by Branch */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={selectedBranch || ''}
            onChange={(e) => setSelectedBranch(e.target.value ? parseInt(e.target.value) : null)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No images found</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Your First Image</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleries.map((gallery) => {
            const branch = branches.find(b => b.id === gallery.branch_id);
            return (
              <div
                key={gallery.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={gallery.image_url}
                    alt={gallery.title || 'Gallery image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, gallery })}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  {gallery.title && (
                    <h3 className="font-semibold text-gray-900 mb-2">{gallery.title}</h3>
                  )}
                  
                  {branch && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Branch:</span> {branch.name}
                    </p>
                  )}

                  {gallery.tags && gallery.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {gallery.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {gallery.display_order !== undefined && (
                    <p className="text-xs text-gray-500">Order: {gallery.display_order}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowUploadModal(false)} />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch *
                </label>
                <select
                  value={uploadData.branchId}
                  onChange={(e) => setUploadData({ ...uploadData, branchId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image File *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., room, interior, lobby"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={uploadData.displayOrder}
                  onChange={(e) => setUploadData({ ...uploadData, displayOrder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional display order"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, gallery: null })}
      />
    </div>
  );
};

export default GalleryList;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { branchService } from '../../services/api';
import type { Branch } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import ConfirmDialog from '../ConfirmDialog';

const BranchList = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; branch: Branch | null }>({
    isOpen: false,
    branch: null,
  });

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchService.getAll();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.branch) return;

    try {
      await branchService.delete(deleteDialog.branch.id);
      setBranches(branches.filter((b) => b.id !== deleteDialog.branch!.id));
      setDeleteDialog({ isOpen: false, branch: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete branch');
    }
  };

  if (loading) return <LoadingSpinner message="Loading branches..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadBranches} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Branches</h2>
        <Link
          to="/branches/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Branch</span>
        </Link>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No branches found</p>
          <Link
            to="/branches/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Branch</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              {branch.thumbnail ? (
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={branch.thumbnail}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{branch.name}</h3>
                  <div className="flex space-x-2">
                    <Link
                      to={`/branches/${branch.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, branch })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{branch.address}</span>
                  </div>

                  {branch.contact_no.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{branch.contact_no[0]}</span>
                    </div>
                  )}

                  {branch.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{branch.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Room Rate</span>
                      <p className="font-semibold text-gray-900">
                        ₹{branch.room_rate[0]?.rate_per_month || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reg. Fee</span>
                      <p className="font-semibold text-gray-900">₹{branch.reg_fee}</p>
                    </div>
                  </div>

                  {branch.is_mess_available && (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Mess Available
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/branches/${branch.id}`}
                  className="block mt-4 text-center py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Branch"
        message={`Are you sure you want to delete "${deleteDialog.branch?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, branch: null })}
      />
    </div>
  );
};

export default BranchList;

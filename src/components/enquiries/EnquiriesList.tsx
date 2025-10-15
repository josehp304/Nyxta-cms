import { useEffect, useState } from 'react';
import { Phone, Mail, MessageSquare, Filter, Eye, Trash2, Calendar } from 'lucide-react';
import { enquiryService, branchService } from '../../services/api';
import type { UserEnquiry, Branch } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import ConfirmDialog from '../ConfirmDialog';

const EnquiriesList = () => {
  const [enquiries, setEnquiries] = useState<UserEnquiry[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<UserEnquiry | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; enquiry: UserEnquiry | null }>({
    isOpen: false,
    enquiry: null,
  });

  useEffect(() => {
    loadData();
  }, [selectedBranch]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [enquiryData, branchData] = await Promise.all([
        enquiryService.getAll(selectedBranch || undefined),
        branchService.getAll(),
      ]);
      setEnquiries(enquiryData);
      setBranches(branchData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const updated = await enquiryService.update(id, { status: status as any });
      setEnquiries(enquiries.map((e) => (e.id === id ? updated : e)));
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.enquiry) return;

    try {
      await enquiryService.delete(deleteDialog.enquiry.id);
      setEnquiries(enquiries.filter((e) => e.id !== deleteDialog.enquiry!.id));
      setDeleteDialog({ isOpen: false, enquiry: null });
      if (selectedEnquiry && selectedEnquiry.id === deleteDialog.enquiry.id) {
        setSelectedEnquiry(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete enquiry');
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (selectedStatus !== 'all' && enquiry.status !== selectedStatus) return false;
    return true;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner message="Loading enquiries..." />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Enquiries</h2>

      {error && <ErrorMessage message={error} />}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
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

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 flex-shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiries List */}
        <div className="space-y-4">
          {filteredEnquiries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No enquiries found</p>
            </div>
          ) : (
            filteredEnquiries.map((enquiry) => {
              const branch = branches.find((b) => b.id === enquiry.branch_id);
              return (
                <div
                  key={enquiry.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedEnquiry?.id === enquiry.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEnquiry(enquiry)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{enquiry.name}</h3>
                      {branch && (
                        <p className="text-sm text-gray-600">{branch.name}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(enquiry.status)}`}>
                      {enquiry.status || 'pending'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{enquiry.phone}</span>
                    </div>
                    {enquiry.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{enquiry.email}</span>
                      </div>
                    )}
                    {enquiry.created_at && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(enquiry.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {enquiry.message && (
                    <p className="mt-3 text-sm text-gray-700 line-clamp-2">{enquiry.message}</p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEnquiry(enquiry);
                    }}
                    className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Enquiry Details */}
        <div className="lg:sticky lg:top-8 h-fit">
          {selectedEnquiry ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">Enquiry Details</h3>
                <button
                  onClick={() => setDeleteDialog({ isOpen: true, enquiry: selectedEnquiry })}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedEnquiry.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <a href={`tel:${selectedEnquiry.phone}`} className="text-blue-600 hover:underline">
                    {selectedEnquiry.phone}
                  </a>
                </div>

                {selectedEnquiry.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600 hover:underline">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                )}

                {selectedEnquiry.branch_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <p className="text-gray-900">
                      {branches.find((b) => b.id === selectedEnquiry.branch_id)?.name || 'Unknown'}
                    </p>
                  </div>
                )}

                {selectedEnquiry.source && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <p className="text-gray-900">{selectedEnquiry.source}</p>
                  </div>
                )}

                {selectedEnquiry.message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedEnquiry.status || 'pending'}
                    onChange={(e) => handleUpdateStatus(selectedEnquiry.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {selectedEnquiry.created_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Received At</label>
                    <p className="text-gray-900">{new Date(selectedEnquiry.created_at).toLocaleString()}</p>
                  </div>
                )}

                {selectedEnquiry.updated_at && selectedEnquiry.updated_at !== selectedEnquiry.created_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <p className="text-gray-900">{new Date(selectedEnquiry.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, enquiry: null })}
      />
    </div>
  );
};

export default EnquiriesList;

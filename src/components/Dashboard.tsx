import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Image, MessageSquare, TrendingUp } from 'lucide-react';
import { branchService, galleryService, enquiryService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const Dashboard = () => {
  const [stats, setStats] = useState({
    branches: 0,
    galleries: 0,
    enquiries: 0,
    pendingEnquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [branches, galleries, enquiries] = await Promise.all([
        branchService.getAll(),
        galleryService.getAll(),
        enquiryService.getAll(),
      ]);

      setStats({
        branches: branches.length,
        galleries: galleries.length,
        enquiries: enquiries.length,
        pendingEnquiries: enquiries.filter((e) => e.status === 'pending' || !e.status).length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadStats} />;

  const statCards = [
    {
      title: 'Total Branches',
      value: stats.branches,
      icon: Building2,
      link: '/branches',
      color: 'bg-blue-500',
    },
    {
      title: 'Gallery Images',
      value: stats.galleries,
      icon: Image,
      link: '/gallery',
      color: 'bg-purple-500',
    },
    {
      title: 'Total Enquiries',
      value: stats.enquiries,
      icon: MessageSquare,
      link: '/enquiries',
      color: 'bg-green-500',
    },
    {
      title: 'Pending Enquiries',
      value: stats.pendingEnquiries,
      icon: TrendingUp,
      link: '/enquiries',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">Welcome to Nyxta CMS - Hostel Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/branches/new"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Add New Branch</p>
                  <p className="text-sm text-gray-600">Create a new hostel branch</p>
                </div>
              </div>
            </Link>

            <Link
              to="/gallery"
              className="block p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Image className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Upload Images</p>
                  <p className="text-sm text-gray-600">Add images to gallery</p>
                </div>
              </div>
            </Link>

            <Link
              to="/enquiries"
              className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">View Enquiries</p>
                  <p className="text-sm text-gray-600">Manage user enquiries</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Backend Status</span>
              <span className="text-green-600 font-medium">● Connected</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">ImageHippo Integration</span>
              <span className="text-green-600 font-medium">● Active</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Branches</span>
              <span className="text-gray-900 font-medium">{stats.branches}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Images</span>
              <span className="text-gray-900 font-medium">{stats.galleries}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Pending Enquiries</span>
              <span className="text-yellow-600 font-medium">{stats.pendingEnquiries}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

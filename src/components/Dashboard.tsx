import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Image, MessageSquare, TrendingUp } from 'lucide-react';
import { branchService, galleryService, enquiryService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Gallery Images',
      value: stats.galleries,
      icon: Image,
      link: '/gallery',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Enquiries',
      value: stats.enquiries,
      icon: MessageSquare,
      link: '/enquiries',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Enquiries',
      value: stats.pendingEnquiries,
      icon: TrendingUp,
      link: '/enquiries',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to Nyxta CMS - Hostel Management System
        </p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.bgColor} p-2 rounded-lg`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/branches/new">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="w-4 h-4 mr-2" />
                Add New Branch
              </Button>
            </Link>

            <Link to="/gallery">
              <Button variant="outline" className="w-full justify-start">
                <Image className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
            </Link>

            <Link to="/enquiries">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                View Enquiries
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current status and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Backend Status</span>
              <span className="text-sm text-green-600 font-medium">● Connected</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">ImageHippo Integration</span>
              <span className="text-sm text-green-600 font-medium">● Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Total Branches</span>
              <span className="text-sm font-medium">{stats.branches}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Total Images</span>
              <span className="text-sm font-medium">{stats.galleries}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Pending Enquiries</span>
              <span className="text-sm text-yellow-600 font-medium">{stats.pendingEnquiries}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

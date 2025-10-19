import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowLeft, Pencil } from 'lucide-react';
import { branchService } from '../../services/api';
import type { Branch } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const formatINR = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
    : 'N/A';

const BranchDetails = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranch = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await branchService.getById(Number(id));
      setBranch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading branch details..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadBranch} />;
  if (!branch) return <ErrorMessage message="Branch not found" onRetry={loadBranch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/branches">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{branch.name}</h2>
        </div>
        <div className="flex gap-2">
          <Link to={`/branches/${branch.id}/edit`}>
            <Button variant="default" className="gap-2">
              <Pencil className="h-4 w-4" /> Edit Branch
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Thumbnail */}
      {branch.thumbnail && (
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            <img
              src={branch.thumbnail}
              alt={branch.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x800?text=Image+Not+Found';
              }}
            />
          </div>
        </Card>
      )}

      {/* Top summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription>Key contact and location information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Address</div>
                <div className="font-medium">{branch.address}</div>
              </div>
            </div>

            {branch.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">{branch.email}</div>
              </div>
            )}

            {branch.contact_no?.length > 0 && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">{branch.contact_no.join(', ')}</div>
              </div>
            )}

            {branch.gmap_link && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Google Maps</div>
                  <a
                    href={branch.gmap_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registration Fee</span>
              <span className="font-semibold">{formatINR(branch.reg_fee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mess Availability</span>
              <span className="font-semibold">
                {branch.is_mess_available ? 'Available' : 'Not available'}
              </span>
            </div>
            {branch.is_mess_available && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mess Price</span>
                <span className="font-semibold">{formatINR(branch.mess_price)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Room Rates */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Room Rates</CardTitle>
          <CardDescription>Monthly rates for different room types</CardDescription>
        </CardHeader>
        <CardContent>
          {branch.room_rate?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branch.room_rate.map((rate, idx) => (
                <div key={`${rate.title}-${idx}`} className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">{rate.title}</div>
                  <div className="text-xl font-semibold">{formatINR(rate.rate_per_month)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No room rates set.</div>
          )}
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Amenities</CardTitle>
          <CardDescription>Facilities available at this branch</CardDescription>
        </CardHeader>
        <CardContent>
          {branch.amenities?.length ? (
            <div className="flex flex-wrap gap-2">
              {branch.amenities.map((amenity, idx) => (
                <span
                  key={`amenity-${idx}`}
                  className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {amenity}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No amenities listed.</div>
          )}
        </CardContent>
      </Card>

      {/* Prime Location Perks */}
      {branch.prime_location_perks && branch.prime_location_perks.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Prime Location Perks</CardTitle>
            <CardDescription>Nearby locations and accessibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branch.prime_location_perks.map((perk, idx) => (
                <div key={`perk-${idx}`} className="rounded-lg border p-4 space-y-2">
                  <div className="font-semibold text-gray-900">{perk.title}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">{perk.distance}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{perk.time_to_reach}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timestamps</CardTitle>
            <CardDescription>Record creation and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created At</span>
              <span className="font-medium">{branch.created_at ? new Date(branch.created_at).toLocaleString() : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated At</span>
              <span className="font-medium">{branch.updated_at ? new Date(branch.updated_at).toLocaleString() : '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BranchDetails;

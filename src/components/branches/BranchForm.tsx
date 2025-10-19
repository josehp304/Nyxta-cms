import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { branchService } from '../../services/api';
import type { Branch } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

type BranchFormData = Omit<Branch, 'id' | 'created_at' | 'updated_at' | 'thumbnail'>;

const BranchForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormData>({
    defaultValues: {
      name: '',
      contact_no: [''],
      email: '',
      address: '',
      room_rate: [{ title: '', rate_per_month: 0 }],
      reg_fee: 0,
      is_mess_available: false,
      mess_price: 0,
      prime_location_perks: [{ title: '', distance: '', time_to_reach: '' }],
      amenities: [''],
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray<BranchFormData>({
    control,
    name: 'contact_no' as any,
  });

  const { fields: roomRateFields, append: appendRoomRate, remove: removeRoomRate } = useFieldArray<BranchFormData>({
    control,
    name: 'room_rate',
  });

  const { fields: amenityFields, append: appendAmenity, remove: removeAmenity } = useFieldArray<BranchFormData>({
    control,
    name: 'amenities' as any,
  });

  const { fields: primeLocationFields, append: appendPrimeLocation, remove: removePrimeLocation } = useFieldArray<BranchFormData>({
    control,
    name: 'prime_location_perks' as any,
  });

  useEffect(() => {
    if (isEditMode) {
      loadBranch();
    }
  }, [id]);

  const loadBranch = async () => {
    try {
      setInitialLoading(true);
      const branch = await branchService.getById(Number(id));
      
      if (branch.thumbnail) {
        setCurrentThumbnail(branch.thumbnail);
        setThumbnailPreview(branch.thumbnail);
      }
      
      reset({
        name: branch.name,
        contact_no: branch.contact_no.length > 0 ? branch.contact_no : [''],
        email: branch.email || '',
        address: branch.address,
        room_rate: branch.room_rate.length > 0 ? branch.room_rate : [{ title: '', rate_per_month: 0 }],
        reg_fee: branch.reg_fee,
        is_mess_available: branch.is_mess_available,
        mess_price: branch.mess_price || 0,
        prime_location_perks: branch.prime_location_perks && branch.prime_location_perks.length > 0 
          ? branch.prime_location_perks 
          : [{ title: '', distance: '', time_to_reach: '' }],
        amenities: branch.amenities && branch.amenities.length > 0 ? branch.amenities : [''],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branch');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(currentThumbnail); // Revert to original if editing
    const fileInput = document.getElementById('thumbnail-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = async (data: BranchFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Clean up empty strings from arrays
      const cleanedData = {
        ...data,
        contact_no: data.contact_no.filter((c: string) => c.trim() !== ''),
        amenities: data.amenities?.filter((a: string) => a.trim() !== '') || [],
        prime_location_perks: data.prime_location_perks?.filter(
          (p: any) => p.title.trim() !== '' || p.distance.trim() !== '' || p.time_to_reach.trim() !== ''
        ) || [],
      };

      if (isEditMode) {
        await branchService.update(Number(id), cleanedData, thumbnailFile || undefined);
      } else {
        await branchService.create(cleanedData, thumbnailFile || undefined);
      }

      navigate('/branches');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner message="Loading branch..." />;

  return (
    <div>
      <button
        onClick={() => navigate('/branches')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Branches</span>
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Branch' : 'Add New Branch'}
        </h2>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Thumbnail Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Branch Thumbnail</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Thumbnail Image (Optional)
              </label>
              
              {thumbnailPreview ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No image selected</p>
                  </div>
                </div>
              )}
              
              <input
                id="thumbnail-input"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 1200x800px (16:9), Max 5MB, JPG/PNG/WEBP
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name *
              </label>
              <input
                {...register('name', { required: 'Branch name is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Numbers *
              </label>
              {contactFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 mb-2">
                  <input
                    {...register(`contact_no.${index}` as const)}
                    type="tel"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91-9876543210"
                  />
                  {contactFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendContact('' as any)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact Number</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          {/* Room Rates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Room Rates *</h3>
            {roomRateFields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type
                    </label>
                    <input
                      {...register(`room_rate.${index}.title` as const, { required: true })}
                      type="text"
                      placeholder="e.g., Single, Double"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate per Month (₹)
                    </label>
                    <input
                      {...register(`room_rate.${index}.rate_per_month` as const, { required: true, valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {roomRateFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoomRate(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendRoomRate({ title: '', rate_per_month: 0 })}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room Type</span>
            </button>
          </div>

          {/* Fees & Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fees & Pricing</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Fee (₹) *
              </label>
              <input
                {...register('reg_fee', { required: true, valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                {...register('is_mess_available')}
                type="checkbox"
                id="is_mess_available"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_mess_available" className="text-sm font-medium text-gray-700">
                Mess Available
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mess Price (₹)
              </label>
              <input
                {...register('mess_price', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
            {amenityFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`amenities.${index}` as const)}
                  type="text"
                  placeholder="e.g., WiFi, AC, Laundry"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {amenityFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendAmenity('' as any)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Amenity</span>
            </button>
          </div>

          {/* Prime Location Perks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Prime Location Perks</h3>
            {primeLocationFields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place Name
                    </label>
                    <input
                      {...register(`prime_location_perks.${index}.title` as const)}
                      type="text"
                      placeholder="e.g., Metro Station"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance
                    </label>
                    <input
                      {...register(`prime_location_perks.${index}.distance` as const)}
                      type="text"
                      placeholder="e.g., 500m"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time to Reach
                    </label>
                    <input
                      {...register(`prime_location_perks.${index}.time_to_reach` as const)}
                      type="text"
                      placeholder="e.g., 5 mins"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {primeLocationFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrimeLocation(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendPrimeLocation({ title: '', distance: '', time_to_reach: '' })}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prime Location Perk</span>
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Branch' : 'Create Branch'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/branches')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchForm;

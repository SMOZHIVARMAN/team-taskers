import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mail, Briefcase, FileText, Award, Clock, Save, X, Lock, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  email: z.string().email('Please enter a valid email'),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
  jobTitle: z.string().max(50, 'Job title must be less than 50 characters').optional(),
  skills: z.string().max(200, 'Skills must be less than 200 characters').optional(),
  experience: z.string().max(50, 'Experience must be less than 50 characters').optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      jobTitle: user?.jobTitle || '',
      skills: user?.skills || '',
      experience: user?.experience || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    // Load profile image from localStorage
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // Fetch latest user data
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      resetProfile({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        jobTitle: user.jobTitle || '',
        skills: user.skills || '',
        experience: user.experience || '',
      });
    }
  }, [user, resetProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        localStorage.setItem('profileImage', base64);
        toast({
          title: "Profile image updated",
          description: "Your profile image has been saved.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoadingProfile(true);
    try {
      await userApi.updateProfile(data);
      updateUser(data);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoadingPassword(true);
    try {
      await userApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      setShowPasswordForm(false);
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.response?.data?.message || "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const skillsList = user?.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and profile</p>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-foreground">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera size={24} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">Click to change photo</p>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            {isEditing ? (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input {...registerProfile('username')} />
                    {profileErrors.username && (
                      <p className="text-xs text-destructive">{profileErrors.username.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input {...registerProfile('email')} type="email" />
                    {profileErrors.email && (
                      <p className="text-xs text-destructive">{profileErrors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    {...registerProfile('bio')}
                    className="flex w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                  {profileErrors.bio && (
                    <p className="text-xs text-destructive">{profileErrors.bio.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <Input {...registerProfile('jobTitle')} placeholder="e.g. Senior Developer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience</label>
                    <Input {...registerProfile('experience')} placeholder="e.g. 5 years" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills (comma-separated)</label>
                  <Input {...registerProfile('skills')} placeholder="e.g. React, TypeScript, Node.js" />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" variant="gradient" disabled={isLoadingProfile}>
                    {isLoadingProfile ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{user?.username}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail size={14} />
                      {user?.email}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>

                {user?.bio && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <FileText size={12} />
                      Bio
                    </label>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.jobTitle && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Briefcase size={12} />
                        Job Title
                      </label>
                      <p className="text-sm font-medium">{user.jobTitle}</p>
                    </div>
                  )}
                  {user?.experience && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        Experience
                      </label>
                      <p className="text-sm font-medium">{user.experience}</p>
                    </div>
                  )}
                </div>

                {skillsList.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Award size={12} />
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {skillsList.map((skill, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock size={18} />
            <h3 className="font-semibold">Password & Security</h3>
          </div>
          {!showPasswordForm && (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input {...registerPassword('oldPassword')} type="password" />
              {passwordErrors.oldPassword && (
                <p className="text-xs text-destructive">{passwordErrors.oldPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input {...registerPassword('newPassword')} type="password" />
              {passwordErrors.newPassword && (
                <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input {...registerPassword('confirmPassword')} type="password" />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="gradient" disabled={isLoadingPassword}>
                {isLoadingPassword ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Update Password
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={() => {
                setShowPasswordForm(false);
                resetPassword();
              }}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;

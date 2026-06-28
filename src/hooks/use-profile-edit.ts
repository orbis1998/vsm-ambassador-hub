import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { invalidateProfileCache, updateAcademyProfile, type AcademyProfileUpdate } from "@/services/profile.service";
import { uploadProfileImage } from "@/services/storage.service";

export function useProfileEdit() {
  const { profile, refreshProfile } = useAuth();

  const update = useMutation({
    mutationFn: (patch: AcademyProfileUpdate) => updateAcademyProfile(profile!.userId, patch),
    onSuccess: async () => {
      invalidateProfileCache();
      await refreshProfile?.();
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadProfileImage(profile!.userId, file, "avatar");
      return updateAcademyProfile(profile!.userId, { avatar_url: url });
    },
    onSuccess: async () => {
      invalidateProfileCache();
      await refreshProfile?.();
    },
  });

  const uploadCover = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadProfileImage(profile!.userId, file, "cover");
      return updateAcademyProfile(profile!.userId, { cover_url: url });
    },
    onSuccess: async () => {
      invalidateProfileCache();
      await refreshProfile?.();
    },
  });

  return { update, uploadAvatar, uploadCover };
}

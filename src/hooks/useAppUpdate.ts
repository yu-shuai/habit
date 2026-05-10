import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useAppUpdate = () => {
  const { setAppUpdate, setCurrentAppInfo } = useAppStore();

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Only run on native devices (Android/iOS)
        if (!Capacitor.isNativePlatform()) {
          setCurrentAppInfo({ version: 'Web Preview', build: '0' });
          return;
        }

        // Fetch current app info
        const appInfo = await App.getInfo();
        setCurrentAppInfo({ version: appInfo.version, build: appInfo.build });
        const currentBuildNumber = parseInt(appInfo.build || '1', 10);

        // Fetch latest release from Supabase
        const { data, error } = await supabase
          .from('app_releases')
          .select('*')
          .order('build_number', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Failed to fetch app updates:', error);
          return;
        }

        if (data && data.build_number > currentBuildNumber) {
          setAppUpdate({
            version: data.version,
            build_number: data.build_number,
            release_notes: data.release_notes,
            download_url: data.download_url,
            is_mandatory: data.is_mandatory,
          });
        }
      } catch (err) {
        console.error('Update check error:', err);
      }
    };

    checkForUpdates();
  }, [setAppUpdate]);
};

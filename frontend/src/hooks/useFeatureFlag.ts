import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const useFeatureFlag = (flagName: string, userId?: string): boolean => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFlag = async () => {
      try {
        const params: any = { flag_name: flagName };
        if (userId) {
          params.user_id = userId;
        }

        const response = await api.get("/runtime/check", { params });

        setEnabled(response.data.enabled);
        console.log(`Feature "${flagName}":`, response.data);
      } catch (error) {
        console.error(`Failed to check feature flag "${flagName}":`, error);
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkFlag();
  }, [flagName, userId]);

  return enabled;
};

export const useAllFeatureFlags = (userId?: string) => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const params = userId ? { user_id: userId } : {};
        const response = await api.get("/runtime/all", { params });

        setFlags(response.data);
        console.log("All feature flags:", response.data);
      } catch (error) {
        console.error("Failed to fetch feature flags:", error);
        setFlags({});
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, [userId]);

  return { flags, loading };
};

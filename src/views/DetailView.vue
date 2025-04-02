<script setup lang="ts">
import type { DeviceStatus, DeviceLogin, DeviceGps } from "@/plugins/types";
import axios from "axios";
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const veloId = route.query.veloId;
const deviceStatus = ref<DeviceStatus>();
const deviceLogin = ref<DeviceLogin>();
const deviceGps = ref<DeviceGps>();

const jwtToken = document.cookie.split("; ").find((row) => row.startsWith("Velo.JWT="))?.split("=")[1];

const hasJwtToken = computed(() => jwtToken !== undefined && jwtToken !== null);

const fetchLastCachedMessage = async () => {
  try {
    const response = await axios.get(`https://velopera.voxel.at/ui/api/deviceInfo/${veloId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (response.data) {
      if (response.data.status?.veloId === veloId) {
        deviceStatus.value = response.data.status;
      }

      if (response.data.login?.veloId === veloId) {
        deviceLogin.value = response.data.login;
      }

      if (response.data.gps?.veloId === veloId) {
        deviceGps.value = response.data.gps;
      }
    } else {
      console.error("No data found for the specified device Id");
    }
  } catch (error) {
    console.error("Failed to fetch last cached message:", error);
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        alert("Session expired. Please login again.");
        router.push("/login");
      } else {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }
};

onMounted(() => {
  if (hasJwtToken.value) {
    fetchLastCachedMessage();
  }

  const instance = getCurrentInstance();

  if (instance) {
    const socket = instance.appContext.config.globalProperties.$socket;

    const handleStatusUpdate = (statusData: DeviceStatus) => {
      if (statusData.veloId === veloId) {
        deviceStatus.value = statusData;
      }
    };

    const handleLoginUpdate = (loginData: DeviceLogin) => {
      if (loginData.veloId === veloId) {
        deviceLogin.value = loginData;
      }
    };

    const handleGpsUpdate = (gpsData: DeviceGps) => {
      if (gpsData.veloId === veloId) {
        deviceGps.value = gpsData;
      }
    };

    socket.on("statusUpdate", handleStatusUpdate);
    socket.on("loginUpdate", handleLoginUpdate);
    socket.on("gpsUpdate", handleGpsUpdate);

    onUnmounted(() => {
      socket.off("statusUpdate", handleStatusUpdate);
      socket.off("loginUpdate", handleLoginUpdate);
      socket.off("gpsUpdate", handleGpsUpdate);
    });
  }
});

const goBack = () => {
  router.push({ name: "Home" });
};

const detailedStatus = computed(() => {
  if (!deviceStatus.value) return [];

  const { statusData } = deviceStatus.value;
  return Object.entries(statusData).map(([key, value]) => ({
    key,
    title: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
    value: value,
  }));
});

const detailedLogin = computed(() => {
  if (!deviceLogin.value) return [];

  const { loginData } = deviceLogin.value;
  return Object.entries(loginData).map(([key, value]) => ({
    key,
    title: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
    value: value,
  }));
});

const detailedGps = computed(() => {
  if (!deviceGps.value) return [];

  const { gpsData } = deviceGps.value;
  return Object.entries(gpsData).map(([key, value]) => ({
    key,
    title: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
    value: value,
  }));
});
</script>

<template>
  <v-container fluid>
    <v-row class="text-center">
      <v-col cols="12">
        <h1>{{ veloId }}</h1>
      </v-col>
    </v-row>
    <v-row>
      <!-- Status Details -->
      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="8">
          <v-list v-if="deviceStatus">
            <v-subheader>Status Details</v-subheader>
            <v-divider :thickness="5"></v-divider>
            <v-list-item-group>
              <template v-for="(item, index) in detailedStatus" :key="`status-${index}`">
                <v-list-item>
                  <v-row align-content="center" no-gutters>
                    <v-col cols="6">
                      <v-list-item-content>
                        <v-list-item-subtitle>
                          {{ item.title }} :
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-col>
                    <v-col cols="6">
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.value }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-col>
                  </v-row>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
          <v-card-actions>
            <v-btn size="small" variant="elevated" color="blue-darken-1" @click="goBack">Go Back</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Login Details -->
      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="8">
          <v-list v-if="deviceLogin">
            <v-subheader>Login Details</v-subheader>
            <v-divider :thickness="5"></v-divider>
            <v-list-item-group>
              <template v-for="(item, index) in detailedLogin" :key="`login-${index}`">
                <v-list-item>
                  <v-row align-content="center" no-gutters>
                    <v-col cols="6">
                      <v-list-item-content>
                        <v-list-item-subtitle>
                          {{ item.title }} :
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-col>
                    <v-col cols="6">
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.value }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-col>
                  </v-row>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>

      <!-- GPS Details -->
      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="8">
          <v-list v-if="deviceGps">
            <v-subheader>GPS Details</v-subheader>
            <v-divider :thickness="5"></v-divider>
            <v-list-item-group>
              <template v-for="(item, index) in detailedGps" :key="`gps-${index}`">
                <v-list-item>
                  <v-row align-content="center" no-gutters>
                    <v-col cols="6">
                      <v-list-item-content>
                        <v-list-item-subtitle>
                          {{ item.title }} :
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-col>
                    <v-col cols="6">
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.value }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-col>
                  </v-row>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

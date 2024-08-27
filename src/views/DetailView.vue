<script setup lang="ts">
import type { DeviceStatus } from "@/plugins/types";
import axios from "axios";
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const veloId = route.query.veloId;
const deviceStatus = ref<DeviceStatus | null>(null);

const jwtToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("Velo.JWT="))
  ?.split("=")[1];

const hasJwtToken = computed(() => jwtToken !== undefined && jwtToken !== null);

const fetchLastCachedMessage = async () => {
  try {
    const response = await axios.get(
      `https://velopera.voxel.at/ui/api/lastStatusMessage/${veloId}`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (response.data.veloId === veloId) {
      deviceStatus.value = response.data;
    } else {
      console.error("No device found with the specified device Id");
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

    socket.on("statusUpdate", handleStatusUpdate);

    onUnmounted(() => {
      socket.off("statusUpdate", handleStatusUpdate);
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
    title: key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: value,
  }));
});
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" lg="10" md="8">
        <v-card class="pa-4" elevation="8">
          <v-card-title>Device Details</v-card-title>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h5"
                >Device ID: {{ veloId }}</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
          <v-divider :thickness="5"></v-divider>
          <v-list v-if="deviceStatus">
            <v-list-item-group>
              <template
                v-for="(item, index) in detailedStatus"
                :key="`detail-${index}`"
              >
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
          <v-progress-circular
            v-else
            indeterminate
            size="50"
          ></v-progress-circular>

          <v-card-actions>
            <v-btn
              size="small"
              variant="elevated"
              color="blue-darken-1"
              @click="goBack"
              >Go Back</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

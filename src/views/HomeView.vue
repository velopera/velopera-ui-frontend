<script setup lang="ts">
import type { DeviceStatus } from "@/plugins/device";
import axios from "axios";
import { computed, onBeforeMount, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const devicesMap = ref<
  Record<string, { imei: string; networkStatus: string; veloId: string }>
>({});
const cachedMessage = ref<DeviceStatus | null>(null);
const router = useRouter();
const headers = [
  { title: "IMEI", key: "imei" },
  { title: "Status", key: "networkStatus" },
  { title: "", key: "" },
];

const getJwtToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("Velo.JWT="))
    ?.split("=")[1];
};

const jwtToken = getJwtToken();
const hasJwtToken = computed(() => jwtToken !== undefined && jwtToken !== null);

const devices = computed(() =>
  Object.entries(devicesMap.value).map(([imei, device]) => ({
    imei,
    networkStatus: device.networkStatus || "Unknown",
    veloId: device.veloId || "N/A",
  }))
);

const viewDetails = (item: {
  imei: string;
  networkStatus: string;
  veloId: string;
}) => {
  router.push({ path: "/detail", query: { veloId: item.veloId } });
};

const fetchLastCachedMessage = async () => {
  try {
    const response = await axios.get(
      "https://velopera.voxel.at/ui/api/lastMessage",
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    const deviceData = response.data;

    Object.keys(deviceData).forEach((key) => {
      const deviceStatus = deviceData[key];
      if (deviceStatus && deviceStatus.statusData) {
        devicesMap.value[deviceStatus.imei] = {
          imei: deviceStatus.imei,
          networkStatus: deviceStatus.statusData.networkStatus || "Unknown",
          veloId: deviceStatus.veloId,
        };
        cachedMessage.value = deviceStatus;
      } else {
        console.error("Invalid device status data:", deviceStatus);
      }
    });
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

onBeforeMount(() => {
  if (hasJwtToken.value) {
    fetchLastCachedMessage();
  }
});

onUnmounted(() => {});

const logout = () => {
  document.cookie = "Velo.JWT=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  router.push("/login");
};
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" lg="10" md="8">
        <v-card class="pa-4" elevation="8">
          <template v-slot:title>
            <v-card-title class="text-center">Device Status</v-card-title>
          </template>
          <v-data-table :headers="headers" :items="devices">
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.imei }}</td>
                <td>
                  <v-chip
                    :color="item.networkStatus === 'online' ? 'green' : 'red'"
                  >
                    {{ item.networkStatus }}
                  </v-chip>
                </td>
                <td>
                  <v-btn
                    size="small"
                    variant="elevated"
                    color="blue-darken-1"
                    @click="viewDetails(item)"
                    >Details</v-btn
                  >
                </td>
              </tr>
            </template>
          </v-data-table>
          <v-btn
            class="mt-2"
            variant="elevated"
            color="orange-darken-1"
            @click="logout"
          >
            <v-icon>mdi-logout</v-icon> Logout
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

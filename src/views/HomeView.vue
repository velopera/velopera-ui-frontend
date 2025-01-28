<script setup lang="ts">
import type { DeviceLogin } from "@/plugins/types";
import axios from "axios";
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const devicesMap = ref<Record<string, DeviceLogin>>({});

const router = useRouter();
const headers = [
  { title: "IMEI", key: "imei" },
  { title: "Status", key: "networkStatus" },
  { title: "", key: "" },
];

const jwtToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("Velo.JWT="))
  ?.split("=")[1];

const hasJwtToken = computed(() => jwtToken !== undefined && jwtToken !== null);

const devices = computed(() =>
  Object.entries(devicesMap.value).map(([imei, device]) => ({
    imei,
    networkStatus: device?.loginData.networkStatus || "Unknown",
    veloId: device?.veloId || "N/A",
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
      "https://velopera.voxel.at/ui/api/loginMessage",
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    const deviceData = response.data;

    Object.keys(deviceData).forEach((key) => {
      const deviceStatus: DeviceLogin = deviceData[key];
      if (deviceStatus && deviceStatus.loginData) {
        devicesMap.value[deviceStatus.imei] = deviceStatus;
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

onMounted(() => {
  if (hasJwtToken.value) {
    fetchLastCachedMessage();
  }
  const instance = getCurrentInstance();

  if (instance) {
    const socket = instance.appContext.config.globalProperties.$socket;

    const handleLoginUpdate = (loginData: DeviceLogin) => {
      const { imei, veloId, loginData: networkStatus } = loginData;

      if (imei && veloId && networkStatus) {
        devicesMap.value[imei] = { imei, veloId, loginData: networkStatus };
      }
    };

    socket.on("loginUpdate", handleLoginUpdate);

    onUnmounted(() => {
      socket.off("loginUpdate", handleLoginUpdate);
      socket.disconnect();
    });
  }
});

const logout = async () => {
  try {
    await axios.post("/ui/api/logout");

    const instance = getCurrentInstance();

    if (instance) {
      const socket = instance.appContext.config.globalProperties.$socket;

      socket.off("loginUpdate");

      socket.disconnect();
    }

    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
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
                  <v-chip :color="item.networkStatus === 'online' ? 'green' : 'red'">
                    {{ item.networkStatus }}
                  </v-chip>
                </td>
                <td>
                  <v-btn size="small" variant="elevated" color="blue-darken-1"
                    @click="viewDetails(item)">Details</v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
          <v-btn class="mt-2" variant="elevated" color="orange-darken-1" @click="logout">
            <v-icon>mdi-logout</v-icon> Logout
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

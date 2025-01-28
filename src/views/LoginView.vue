<script setup lang="ts">
import axios from "axios";
import Cookies from "js-cookie";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const form = ref({
  username: "",
  password: "",
  remember: false,
});
const isLoading = ref(false);

const submit = async () => {
  isLoading.value = true;

  try {
    const response = await axios.post(
      "https://velopera.voxel.at/ui/api/login",
      {
        username: form.value.username,
        password: form.value.password,
      },
      {
        withCredentials: true,
      }
    );

    Cookies.set("Velo.JWT", response.data.accessToken, { expires: 1 });
    router.push("/");
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please check your credentials and try again.");
  } finally {
    isLoading.value = false;
  }
};

const rules = {
  required: (value: any) => !!value || "Required.",
};
</script>

<template>
  <v-container fluid>
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular v-if="isLoading" indeterminate color="white"></v-progress-circular>
    </v-overlay>
    <v-row justify="center">
      <v-col md="4">
        <v-card class="pa-4" :elevation="8">
          <v-card-title class="text-center">Login</v-card-title>
          <v-card-item>
            <v-form @submit.prevent="submit">
              <v-text-field :rules="[rules.required]" prepend-inner-icon="mdi-account" v-model="form.username"
                label="Username"></v-text-field>

              <v-text-field type="password" :rules="[rules.required]" prepend-inner-icon="mdi-key"
                v-model="form.password" label="Password"></v-text-field>

              <v-checkbox v-model="form.remember" label="Remember Me" color="blue-darken-1"></v-checkbox>

              <v-btn type="submit" block class="mt-2" variant="elevated" color="blue-darken-1">
                <v-icon>mdi-login</v-icon> Login
              </v-btn>
            </v-form>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

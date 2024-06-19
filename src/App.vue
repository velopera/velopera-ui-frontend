<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import { useTheme } from "vuetify";

const darkTheme = ref(true);
const theme = useTheme();

function changeTheme() {
  darkTheme.value = !darkTheme.value;
  theme.global.name.value = darkTheme.value ? "light" : "dark";
}
</script>

<template>
  <v-app>
    <v-main>
      <v-toolbar title="SecOPERA" :elevation="8" color="primary">
        <v-spacer></v-spacer>

        <v-btn icon @click="changeTheme">
          <v-icon
            :icon="darkTheme ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          ></v-icon>
        </v-btn>
      </v-toolbar>

      <RouterView />
    </v-main>
  </v-app>
</template>

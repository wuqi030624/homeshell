<template>
  <DashboardView />
  <TerminalDrawer
    :is-open="appStore.isTerminalOpen"
    @close="appStore.toggleTerminal"
  />
  <OutputPopup
    :is-open="appStore.isPopupOpen"
    :content="appStore.popupContent"
    @close="appStore.hidePopup"
  />
  <CommandPalette />
  <QuickBar />
  <KeyboardHelp />
  <ConfirmDialog />
  <ToastNotification />
</template>

<script setup lang="ts">
import DashboardView from "@/components/dashboard/DashboardView.vue";
import TerminalDrawer from "@/components/dashboard/TerminalDrawer.vue";
import OutputPopup from "@/components/dashboard/OutputPopup.vue";
import CommandPalette from "@/components/dashboard/CommandPalette.vue";
import QuickBar from "@/components/dashboard/QuickBar.vue";
import KeyboardHelp from "@/components/dashboard/KeyboardHelp.vue";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog.vue";
import ToastNotification from "@/components/dashboard/ToastNotification.vue";
import { useAppStore } from "@/stores/appStore";
import { useKeyboard } from "@/composables/useKeyboard";

const appStore = useAppStore();

useKeyboard();
</script>

<style scoped></style>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    isEditing: boolean;
    placeholder?: string;
    multiline?: boolean;
  }>(),
  {
    placeholder: "",
    multiline: false,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "commit", value: string): void;
  (e: "cancel"): void;
  (e: "startEdit"): void;
}>();

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const editValue = ref(props.modelValue);

watch(
  () => props.isEditing,
  async (isEditing) => {
    if (isEditing) {
      editValue.value = props.modelValue;
      await nextTick();
      inputRef.value?.focus();
      inputRef.value?.select();
    }
  }
);

watch(
  () => props.modelValue,
  (val) => {
    if (!props.isEditing) {
      editValue.value = val;
    }
  }
);

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !props.multiline) {
    e.preventDefault();
    commitEdit();
  } else if (e.key === "Enter" && props.multiline && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    commitEdit();
  } else if (e.key === "Escape") {
    e.preventDefault();
    cancelEdit();
  }
}

function commitEdit() {
  const trimmed = editValue.value.trim();
  if (trimmed && trimmed !== props.modelValue) {
    emit("update:modelValue", trimmed);
    emit("commit", trimmed);
  } else {
    emit("cancel");
  }
}

function cancelEdit() {
  editValue.value = props.modelValue;
  emit("cancel");
}

function handleBlur() {
  commitEdit();
}

function handleDoubleClick() {
  if (!props.isEditing) {
    emit("startEdit");
  }
}
</script>

<template>
  <div class="editable-text" :class="{ 'is-editing': isEditing }">
    <template v-if="isEditing">
      <textarea
        v-if="multiline"
        ref="inputRef"
        v-model="editValue"
        :placeholder="placeholder"
        class="edit-input multiline"
        @keydown="handleKeydown"
        @blur="handleBlur"
      />
      <input
        v-else
        ref="inputRef"
        v-model="editValue"
        type="text"
        :placeholder="placeholder"
        class="edit-input"
        @keydown="handleKeydown"
        @blur="handleBlur"
      />
    </template>
    <span v-else class="display-text" @dblclick="handleDoubleClick">
      <slot>{{ modelValue || placeholder }}</slot>
    </span>
  </div>
</template>

<style scoped>
.editable-text {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.display-text {
  cursor: text;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.edit-input {
  width: 100%;
  padding: 4px 8px;
  font-size: inherit;
  font-family: inherit;
  color: var(--hs-text);
  background: var(--hs-surface-0);
  border: 1px solid var(--hs-accent);
  border-radius: var(--hs-radius-sm);
  outline: none;
  transition: all var(--motion-fast) var(--ease-out);
}

.edit-input:focus {
  box-shadow: 0 0 0 2px var(--hs-focus-ring);
}

.edit-input.multiline {
  min-height: 60px;
  resize: vertical;
  white-space: pre-wrap;
}

.edit-input::placeholder {
  color: var(--hs-muted);
  opacity: 0.6;
}
</style>

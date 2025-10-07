<script setup lang="ts">
  import type { ScreenDetail } from '@/type/electron/entity';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { Ref, ref, watch } from 'vue';

  const props = defineProps<{
    card: ScreenDetail;
    checked: boolean;
  }>();
  const emit = defineEmits(['update:checked']);
  const isChecked: Ref<boolean> = ref(false);

  const cardChecked = (e: any) => {
    emit('update:checked', props.card.screenIndex, e.target.checked);
  };

  watch(
    () => props.checked,
    (val) => {
      isChecked.value = val;
    }
  );

  defineExpose({
    isChecked,
  });
</script>

<template>
  <div
    class="group relative w-full h-full overflow-hidden cursor-pointer rounded-lg hover:scale-105 transition-all duration-200 ease-out"
  >
    <a-image
      :src="buildLoadProtocolUrl(steamStore().installPath, props.card.screenThumb)"
      :preview="false"
      class="w-full h-full object-cover rounded-lg"
    />
    <a-checkbox :checked="isChecked" class="!absolute top-2 left-2" @change="cardChecked" />
  </div>
</template>

<style scoped></style>

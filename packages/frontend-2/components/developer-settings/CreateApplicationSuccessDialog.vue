<template>
  <LayoutDialog v-model:open="isOpen" max-width="sm" :buttons="dialogButtons">
    <template #header>Create Application</template>
    <div class="flex flex-col gap-4 text-sm text-foreground">
      <div class="flex flex-col gap-3">
        <h6 class="h6 font-bold text-center">Your new app is ready</h6>
        <div class="grid grid-cols-2 gap-x-6 gap-y-3 py-2 text-sm max-w-xs mx-auto">
          <div class="flex items-center">App Id:</div>
          <div class="w-40">
            <CommonClipboardInputWithToast
              v-if="props.application?.id"
              :value="props.application?.id"
            />
          </div>
          <div class="flex items-center">App Secret:</div>
          <div class="w-40">
            <CommonClipboardInputWithToast
              v-if="props.application?.secret"
              :value="props.application?.secret"
            />
          </div>
        </div>
      </div>
      <div class="flex gap-4 items-center border-primary border rounded-lg px-4 py-3">
        <ExclamationTriangleIcon class="h-8 w-8 mt-0.5 text-primary" />
        <div class="max-w-md flex flex-col gap-1.5 text-sm">
          <p>
            <strong>Note:</strong>
            To authenticate users inside your app, direct them to
          </p>
          <CommonClipboardInputWithToast
            v-if="props.application?.secret"
            :value="`https://latest.speckle.dev/authn/verify/${props.application?.id}/{code_challenge}`"
            is-multiline
          />
          <p>
            `{code_challenge}` is an OAuth2 plain code challenge that your app needs to
            generate for each authentication request.
          </p>
        </div>
      </div>
    </div>
  </LayoutDialog>
</template>

<script setup lang="ts">
import { LayoutDialog } from '@speckle/ui-components'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { ApplicationItem } from '~~/lib/developer-settings/helpers/types'

const props = defineProps<{
  application: ApplicationItem | null
}>()

const isOpen = defineModel<boolean>('open', { required: true })

const dialogButtons = computed(() => [
  {
    text: 'Close',
    props: { color: 'primary', fullWidth: true },
    onClick: () => (isOpen.value = false)
  }
])
</script>

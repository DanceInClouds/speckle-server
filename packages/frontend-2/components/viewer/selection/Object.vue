<template>
  <div
    :class="`${
      isModifiedQuery.modified && root
        ? 'outline outline-2 rounded py-1 px-1 outline-amber-500'
        : ''
    }`"
  >
    <div class="mb-1 flex items-center">
      <button
        class="flex h-full w-full p-2 items-center justify-between gap-4 rounded bg-foundation-2 hover:sm:bg-primary-muted hover:text-primary"
        :class="unfold && 'text-primary'"
        @click="unfold = !unfold"
      >
        <div :class="`truncate text-xs font-bold ${headerClasses}`">
          {{ title || headerAndSubheader.header }}
          <span
            v-if="(props.root || props.modifiedSibling) && isModifiedQuery.modified"
          >
            {{ isModifiedQuery.isNew ? '(New)' : '(Old)' }}
          </span>
        </div>
        <ChevronDownIcon
          :class="`h-3 w-3 transition ${headerClasses} ${
            !unfold ? '-rotate-90' : 'rotate-0'
          }`"
        />
      </button>
    </div>
    <div v-if="unfold" class="ml-1 space-y-1 p-2">
      <div
        v-for="(kvp, index) in [
          ...categorisedValuePairs.primitives,
          ...categorisedValuePairs.nulls
        ]"
        :key="index"
      >
        <div
          :class="`grid grid-cols-3 ${
            kvp.value === null || kvp.value === undefined ? 'text-foreground-2' : ''
          }`"
        >
          <div
            class="col-span-1 truncate text-xs font-bold"
            :title="(kvp.key as string)"
          >
            {{ kvp.key }}
          </div>
          <div class="col-span-2 pl-1 truncate text-xs" :title="(kvp.value as string)">
            <!-- NOTE: can't do kvp.value || 'null' because 0 || 'null' = 'null' -->
            {{ kvp.value === null ? 'null' : kvp.value }}
          </div>
        </div>
      </div>
      <div v-for="(kvp, index) in categorisedValuePairs.objects" :key="index">
        <ViewerSelectionObject
          :object="(kvp.value as Record<string,unknown>) || {}"
          :title="(kvp.key as string)"
          :unfold="false"
        />
      </div>
      <div
        v-for="(kvp, index) in categorisedValuePairs.nonPrimitiveArrays"
        :key="index"
        class="text-xs"
      >
        <div class="text-foreground-2 grid grid-cols-3">
          <div
            class="col-span-1 truncate text-xs font-bold"
            :title="(kvp.key as string)"
          >
            {{ kvp.key }}
          </div>
          <div class="col-span-2 flex w-full min-w-0 truncate text-xs">
            <div class="flex-grow truncate">{{ kvp.innerType }} array</div>
            <div class="text-foreground-2">({{ kvp.arrayLength }})</div>
          </div>
        </div>
      </div>
      <div v-for="(kvp, index) in categorisedValuePairs.primitiveArrays" :key="index">
        <div class="grid grid-cols-3">
          <div
            class="col-span-1 truncate text-xs font-bold"
            :title="(kvp.key as string)"
          >
            {{ kvp.key }}
          </div>
          <div
            class="col-span-2 flex w-full min-w-0 truncate text-xs"
            :title="(kvp.value as string)"
          >
            <div class="flex-grow truncate">{{ kvp.arrayPreview }}</div>
            <div class="text-foreground-2">({{ kvp.arrayLength }})</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isModifiedQuery.modified && isModifiedQuery.pair && root" class="mt-2">
      <ViewerSelectionObject :object="isModifiedQuery.pair" :modified-sibling="true" />
    </div>
  </div>
</template>
<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import type { SpeckleObject } from '~~/lib/common/helpers/sceneExplorer'
import { getHeaderAndSubheaderForSpeckleObject } from '~~/lib/object-sidebar/helpers'
import { useInjectedViewerState } from '~~/lib/viewer/composables/setup'
const {
  ui: {
    diff: { result, enabled: diffEnabled }
  }
} = useInjectedViewerState()

const props = withDefaults(
  defineProps<{
    object: SpeckleObject
    root?: boolean
    title?: string
    unfold?: boolean
    debug?: boolean
    modifiedSibling?: boolean
  }>(),
  { debug: false, unfold: false, root: false, modifiedSibling: false }
)

const unfold = ref(props.unfold)

const isAdded = computed(() => {
  if (!diffEnabled.value) return false
  return (
    result.value?.added.findIndex(
      (o) => (o.model.raw as SpeckleObject).applicationId === props.object.applicationId
    ) !== -1
  )
})

const isRemoved = computed(() => {
  if (!diffEnabled.value) return false
  return (
    result.value?.removed.findIndex(
      (o) => (o.model.raw as SpeckleObject).applicationId === props.object.applicationId
    ) !== -1
  )
})

const isUnchanged = computed(() => {
  if (!diffEnabled.value) return false
  return (
    result.value?.unchanged.findIndex(
      (o) => (o.model.raw as SpeckleObject).applicationId === props.object.applicationId
    ) !== -1
  )
})

const isModifiedQuery = computed(() => {
  // if (props.modifiedSibling) return { modified: false } // prevent recursion?
  if (!diffEnabled.value) return { modified: false }
  const modifiedObjectPairs = result.value?.modified.map((pair) => {
    return [pair[0].model.raw as SpeckleObject, pair[1].model.raw as SpeckleObject]
  })
  if (!modifiedObjectPairs) return { modified: false }
  const obj = props.object
  const pairedItems = modifiedObjectPairs.find(
    (item) => item[0].id === obj.id || item[1].id === obj.id
  )
  if (!pairedItems) return { modified: false }
  const pair = pairedItems[0].id === obj.id ? pairedItems[1] : pairedItems[0]
  if (!pair) return { modified: false }
  return {
    modified: true,
    pair,
    isNew: pairedItems[0].id !== obj.id
  }
})

const headerClasses = computed(() => {
  if (props.modifiedSibling) return 'text-amber-500'
  if (!props.root) return ''
  if (!diffEnabled.value) return ''
  if (!Object.keys(props.object).includes('applicationId')) return ''

  if (isAdded.value) return 'text-green-500'

  if (isRemoved.value) return 'text-red-500'

  if (isUnchanged.value) return 'text-foreground'

  return 'text-amber-500'
})

const headerAndSubheader = computed(() => {
  return getHeaderAndSubheaderForSpeckleObject(props.object)
})

const ignoredProps = [
  '__closure',
  'displayMesh',
  'displayValue',
  'totalChildrenCount',
  '__importedUrl',
  '__parents',
  'bbox'
]

const keyValuePairs = computed(() => {
  const kvps = [] as Record<string, unknown>[]

  // handle revit paramters
  if (props.title === 'parameters') {
    const paramKeys = Object.keys(props.object)
    for (const prop of paramKeys) {
      const param = props.object[prop] as Record<string, unknown>
      if (!param) continue
      kvps.push({
        key: param.name as string,
        type: typeof param.value,
        innerType: null,
        arrayLength: null,
        arrayPreview: null,
        value: param.value
      })
    }
    return kvps
  }

  const objectKeys = Object.keys(props.object)
  for (const key of objectKeys) {
    if (ignoredProps.includes(key)) continue
    const type = Array.isArray(props.object[key]) ? 'array' : typeof props.object[key]
    let innerType = null
    let arrayLength = null
    let arrayPreview = null
    if (type === 'array') {
      const arr = props.object[key] as unknown[]
      arrayLength = arr.length
      if (arr.length > 0) {
        innerType = Array.isArray(arr[0]) ? 'array' : typeof arr[0]
        arrayPreview = arr.slice(0, 3).join(', ')
        if (arr.length > 10) arrayPreview += ' ...' // in case truncate doesn't hit
      }
    }
    kvps.push({
      key,
      type,
      innerType,
      arrayLength,
      arrayPreview,
      value: props.object[key]
    })
  }

  return kvps
})

const categorisedValuePairs = computed(() => {
  return {
    primitives: keyValuePairs.value.filter(
      (item) => item.type !== 'object' && item.type !== 'array' && item.value !== null
    ),
    objects: keyValuePairs.value.filter(
      (item) => item.type === 'object' && item.value !== null
    ),
    nonPrimitiveArrays: keyValuePairs.value.filter(
      (item) =>
        item.type === 'array' &&
        item.value !== null &&
        (item.innerType === 'object' || item.innerType === 'array')
    ),
    primitiveArrays: keyValuePairs.value.filter(
      (item) =>
        item.type === 'array' &&
        item.value !== null &&
        !(item.innerType === 'object' || item.innerType === 'array')
    ),
    nulls: keyValuePairs.value.filter((item) => item.value === null)
  }
})
</script>

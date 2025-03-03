/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
/* eslint-disable camelcase */
import {
  AlwaysStencilFunc,
  IUniform,
  Material,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
  PointsMaterial,
  ReplaceStencilOp,
  UniformsUtils
} from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { MaterialOptions } from './Materials'

class SpeckleUserData {
  toJSON() {
    return {}
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Uniforms = Record<string, any>

export class SpeckleMaterial {
  protected _internalUniforms
  protected _stencilOutline
  public needsCopy: boolean

  protected get vertexProgram(): string {
    return ''
  }

  protected get fragmentProgram(): string {
    return ''
  }

  protected get uniformsDef(): Uniforms {
    return {
      empty: 'empty'
    }
  }

  protected get baseUniforms(): { [uniform: string]: IUniform } {
    return {
      emptyBase: { value: 'emptyBase' }
    }
  }

  protected set stencilOutline(value: boolean) {
    this['stencilWrite'] = value
    if (value) {
      this['stencilWriteMask'] = 0xff
      this['stencilRef'] = 0x00
      this['stencilFunc'] = AlwaysStencilFunc
      this['stencilZFail'] = ReplaceStencilOp
      this['stencilZPass'] = ReplaceStencilOp
      this['stencilFail'] = ReplaceStencilOp
    }
  }

  protected set pointSize(value: number) {
    this['size'] = value
  }

  protected init(defines = []) {
    this['userData'] = new SpeckleUserData()
    this.setUniforms(this.uniformsDef)
    this.setDefines(defines)
    this['onBeforeCompile'] = this.onCompile
  }

  protected setUniforms(def: Uniforms) {
    for (const k in def) {
      this['userData'][k] = {
        value: def[k]
      }
    }
    this['uniforms'] = UniformsUtils.merge([this.baseUniforms, this['userData']])
  }

  protected setDefines(defines = []) {
    if (defines) {
      this['defines'] = {}
      for (let k = 0; k < defines.length; k++) {
        this['defines'][defines[k]] = ' '
      }
    }
  }

  protected copyUniforms(material: Material) {
    for (const k in material.userData) {
      if (this['userData'][k] !== undefined)
        this['userData'][k].value = material.userData[k].value
    }
  }

  protected bindUniforms() {
    if (!this._internalUniforms) return

    for (const k in this.uniformsDef) {
      this._internalUniforms.uniforms[k] = this['userData'][k]
    }
  }

  protected copyFrom(source) {
    this['userData'] = new SpeckleUserData()
    this.setUniforms(this.uniformsDef)
    this.copyUniforms(source)
    this.bindUniforms()
    Object.assign(this['defines'], source.defines)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onCompile(shader, renderer) {
    this._internalUniforms = shader
    this.bindUniforms()
    shader.vertexShader = this.vertexProgram
    shader.fragmentShader = this.fragmentProgram
  }

  public fastCopy(from: Material, to: Material) {
    to.alphaTest = from.alphaTest
    to.alphaToCoverage = from.alphaToCoverage
    to.blendDst = from.blendDst
    to.blendDstAlpha = from.blendDstAlpha
    to.blendEquation = from.blendEquation
    to.blendEquationAlpha = from.blendEquationAlpha
    to.blending = from.blending
    to.blendSrc = from.blendSrc
    to.blendSrcAlpha = from.blendSrcAlpha
    to.clipIntersection = from.clipIntersection
    to.clippingPlanes = from.clippingPlanes
    to.clipShadows = from.clipShadows
    to.colorWrite = from.colorWrite
    Object.assign(to.defines, from.defines)
    to.depthFunc = from.depthFunc
    to.depthTest = from.depthTest
    to.depthWrite = from.depthWrite
    to.fog = from.fog
    to.format = from.format
    to.stencilWrite = from.stencilWrite
    to.stencilFunc = from.stencilFunc
    to.stencilRef = from.stencilRef
    to.stencilWriteMask = from.stencilWriteMask
    to.stencilFuncMask = from.stencilFuncMask
    to.stencilFail = from.stencilFail
    to.stencilZFail = from.stencilZFail
    to.stencilZPass = from.stencilZPass
    to.opacity = from.opacity
    to.polygonOffset = from.polygonOffset
    to.polygonOffsetFactor = from.polygonOffsetFactor
    to.polygonOffsetUnits = from.polygonOffsetUnits
    to.premultipliedAlpha = from.premultipliedAlpha
    to.dithering = from.dithering
    to.side = from.side
    to.shadowSide = from.shadowSide
    to.toneMapped = from.toneMapped
    to.transparent = from.transparent
    to.vertexColors = from.vertexColors
    to.visible = from.visible
  }

  public setMaterialOptions(options: MaterialOptions) {
    this.stencilOutline = options.stencilOutlines || false
    this.pointSize = options.pointSize || 1
  }
}

export class ExtendedMeshStandardMaterial extends MeshStandardMaterial {}
export class ExtendedMeshBasicMaterial extends MeshBasicMaterial {}
export class ExtendedMeshDepthMaterial extends MeshDepthMaterial {}
export class ExtendedMeshNormalMaterial extends MeshNormalMaterial {}
export class ExtendedLineMaterial extends LineMaterial {}
export class ExtendedPointsMaterial extends PointsMaterial {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtendedMeshStandardMaterial extends SpeckleMaterial {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtendedMeshBasicMaterial extends SpeckleMaterial {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtendedMeshDepthMaterial extends SpeckleMaterial {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtendedMeshNormalMaterial extends SpeckleMaterial {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtendedLineMaterial extends SpeckleMaterial {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtendedPointsMaterial extends SpeckleMaterial {}

applyMixins(ExtendedMeshStandardMaterial, [SpeckleMaterial])
applyMixins(ExtendedMeshBasicMaterial, [SpeckleMaterial])
applyMixins(ExtendedMeshDepthMaterial, [SpeckleMaterial])
applyMixins(ExtendedMeshNormalMaterial, [SpeckleMaterial])
applyMixins(ExtendedLineMaterial, [SpeckleMaterial])
applyMixins(ExtendedPointsMaterial, [SpeckleMaterial])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
      )
    })
  })
}

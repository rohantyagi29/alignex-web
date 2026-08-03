import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'

const PHOTO_CATEGORIES = [
  { id: 'frontal-rest',      label: 'Frontal at Rest',    img: '/assets/form-refs/frontal-rest.png' },
  { id: 'frontal-smiling',   label: 'Frontal Smiling',    img: '/assets/form-refs/frontal-smiling.png' },
  { id: 'profile',           label: 'Profile View',       img: '/assets/form-refs/profile.png' },
  { id: 'right-lateral',     label: 'Right Lateral',      img: '/assets/form-refs/right-lateral.png' },
  { id: 'frontal-occlusion', label: 'Frontal Occlusion',  img: '/assets/form-refs/frontal-occlusion.png' },
  { id: 'left-lateral',      label: 'Left Lateral',       img: '/assets/form-refs/left-lateral.png' },
  { id: 'upper-occlusal',    label: 'Upper Occlusal',     img: '/assets/form-refs/upper-occlusal.png' },
  { id: 'lower-occlusal',    label: 'Lower Occlusal',     img: '/assets/form-refs/lower-occlusal.png' },
]

const XRAY_CATEGORIES = [
  { id: 'lateral-ceph', label: 'Lateral Cephalogram', img: '/assets/form-refs/lateral-ceph.png' },
  { id: 'opg',          label: 'OPG',                 img: '/assets/form-refs/opg.png' },
]

const SCAN_CATEGORIES = [
  { id: 'upper-scan', label: 'Upper Arch Scan', img: null, hint: 'STL only', accept: ['.stl'] },
  { id: 'lower-scan', label: 'Lower Arch Scan', img: null, hint: 'STL only', accept: ['.stl'] },
]

const OTHER_CATEGORIES = [
  { id: 'other', label: 'Other', img: null, hint: 'Anything else' },
]

const CATEGORIES = [...PHOTO_CATEGORIES, ...XRAY_CATEGORIES, ...SCAN_CATEGORIES, ...OTHER_CATEGORIES]

const isFileCompatible = (file, category) => {
  if (!category?.accept) return true
  return category.accept.some((ext) => file.name.toLowerCase().endsWith(ext))
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary/40" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinejoin="round" />
    </svg>
  )
}

function UpperScanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 7V5a2 2 0 0 1 2-2h2M22 7V5a2 2 0 0 0-2-2h-2M2 17v2a2 2 0 0 0 2 2h2M22 17v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" />
      <path d="M7 13h10" strokeLinecap="round" />
      <path d="M12 13V8" strokeLinecap="round" />
      <polyline points="9 11 12 8 15 11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LowerScanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 7V5a2 2 0 0 1 2-2h2M22 7V5a2 2 0 0 0-2-2h-2M2 17v2a2 2 0 0 0 2 2h2M22 17v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" />
      <path d="M7 11h10" strokeLinecap="round" />
      <path d="M12 11v5" strokeLinecap="round" />
      <polyline points="9 13 12 16 15 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OtherIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 1 1 4.27 2.72C12.6 12.23 12 12.9 12 14" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  )
}

const NO_IMG_ICON = {
  'upper-scan': UpperScanIcon,
  'lower-scan': LowerScanIcon,
  other: OtherIcon,
}

function Thumb({ file, progress, style, dragHandleProps, isDragging, isSelected, nodeRef }) {
  return (
    <div
      ref={nodeRef}
      {...dragHandleProps}
      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing select-none flex-shrink-0 transition-all ${
        isDragging
          ? 'opacity-40'
          : isSelected
            ? 'border-primary shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-1'
            : 'border-primary/20 hover:border-primary/50 shadow-sm hover:shadow-md'
      }`}
      style={style}
    >
      {file.preview ? (
        <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <FileIcon />
        </div>
      )}
      {progress != null && progress < 100 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
            />
          </svg>
        </div>
      )}
      <div className={`absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] px-1 py-0.5 truncate transition-opacity ${
        !file.preview || isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
      }`}>
        {file.name}
      </div>
    </div>
  )
}

function DraggableThumb({ file, progress, isSelected, onTap }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: file.id })
  const tapStart = useRef(null)

  return (
    <div
      className="touch-manipulation"
      onPointerDown={() => { tapStart.current = Date.now() }}
      onPointerUp={() => {
        const dt = tapStart.current !== null ? Date.now() - tapStart.current : Infinity
        tapStart.current = null
        if (dt < 190 && !isDragging) onTap?.(file.id)
      }}
    >
      <Thumb
        file={file}
        progress={progress}
        isDragging={isDragging}
        isSelected={isSelected}
        nodeRef={setNodeRef}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

function CategoryDropZone({ category, files, onRemove, uploadProgress, activeFile, selectedFileId, selectedFile, onAssign, onSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: category.id })
  const Icon = NO_IMG_ICON[category.id]

  const compatible = !activeFile || isFileCompatible(activeFile, category)
  const rejected = isOver && !compatible

  const tapAssignable = selectedFile && isFileCompatible(selectedFile, category)

  const borderCls = rejected
    ? 'border-red-400 shadow-lg shadow-red-100 scale-[1.02]'
    : isOver
      ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
      : tapAssignable
        ? 'border-primary/60 shadow-md shadow-primary/10'
        : 'border-gray-200'

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (selectedFileId && onAssign) onAssign(category.id) }}
      className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 flex flex-col ${
        category.img ? 'aspect-square' : 'min-h-[80px]'
      } ${borderCls} ${tapAssignable ? 'cursor-pointer' : ''}`}
    >
      {/* Tap-to-assign badge */}
      {tapAssignable && !isOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-primary text-white text-[9px] font-semibold px-2 py-1 rounded-full shadow-md">
            Tap to assign
          </div>
        </div>
      )}

      {/* Full-card faded background — only when empty */}
      {category.img && files.length === 0 && (
        <img
          src={category.img}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-300 ${
            isOver && !rejected ? 'opacity-[0.10]' : 'opacity-[0.07]'
          }`}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className={`flex items-center gap-2 px-2.5 py-2 flex-shrink-0 transition-colors ${rejected ? 'bg-red-50' : isOver ? 'bg-primary/5' : ''}`}>
          {category.img && files.length > 0 && (
            <img src={category.img} alt="" aria-hidden="true" className="w-7 h-7 object-contain rounded flex-shrink-0 opacity-40" />
          )}
          {!category.img && Icon && (
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${rejected ? 'bg-red-50 border-red-200' : 'bg-gray-100 border-gray-200'}`}>
              <Icon />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 text-[11px] leading-tight line-clamp-2">{category.label}</p>
            {rejected ? (
              <p className="text-[9px] text-red-500 mt-0.5 font-medium">STL files only</p>
            ) : files.length > 0 ? (
              <p className="text-[9px] text-primary font-medium mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''}</p>
            ) : category.hint ? (
              <p className="text-[9px] text-gray-400 mt-0.5">{category.hint}</p>
            ) : null}
          </div>
        </div>

        {/* Drop / file area */}
        <div className={`px-2.5 pb-2.5 flex-1 flex flex-col ${rejected ? 'bg-red-50/40' : ''}`}>
          {files.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 content-start">
              {files.map((f) => (
                <div key={f.id} className="relative group">
                  <DraggableThumb
                    file={f}
                    progress={uploadProgress?.[f.id]}
                    isSelected={selectedFileId === f.id}
                    onTap={onSelect}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(f.id) }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 leading-none touch-manipulation"
                  >×</button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex-1 flex items-center justify-center rounded-lg border border-dashed text-[10px] transition-colors ${
              rejected ? 'border-red-300 text-red-400' : isOver ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-gray-400'
            }`}>
              {rejected ? '✕ Not allowed' : isOver ? 'Drop here' : category.accept ? 'Drag STL here' : 'Drag here'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UntaggedPool({ files, onRemove, uploadProgress, selectedFileId, onSelect, compact }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'pool' })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 transition-all duration-200 ${
        isOver ? 'border-primary bg-primary/5' : 'border-dashed border-gray-300 bg-white'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <p className={`font-medium uppercase tracking-wider mb-1 ${compact ? 'text-[9px]' : 'text-xs'} ${
        selectedFileId ? 'text-primary' : 'text-gray-400'
      }`}>
        {selectedFileId ? 'Tap a category →' : `Untagged (${files.length})`}
      </p>
      {!selectedFileId && (
        <p className={`text-gray-400 mb-2 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
          {compact ? 'Tap to select, then tap a category' : 'Drag to a category — or tap to select'}
        </p>
      )}
      <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {files.map((f) => (
          <div key={f.id} className="relative group">
            <DraggableThumb
              file={f}
              progress={uploadProgress?.[f.id]}
              isSelected={selectedFileId === f.id}
              onTap={(id) => onSelect(selectedFileId === id ? null : id)}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(f.id) }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >×</button>
          </div>
        ))}
        {files.length === 0 && isOver && (
          <div className="w-full flex items-center justify-center h-10 rounded-lg border border-dashed border-primary text-xs text-primary">
            Drop to untag
          </div>
        )}
        {files.length === 0 && !isOver && (
          <p className="text-xs text-gray-300 italic">All files tagged</p>
        )}
      </div>
    </div>
  )
}

function CatGroup({ label, cols, cats, filesByCategory, removeFile, uploadProgress, activeFile, selectedFileId, selectedFile, onAssign, onSelect }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className={`grid ${cols} gap-3`}>
        {cats.map((cat) => (
          <CategoryDropZone
            key={cat.id}
            category={cat}
            files={filesByCategory(cat.id)}
            onRemove={removeFile}
            uploadProgress={uploadProgress}
            activeFile={activeFile}
            selectedFileId={selectedFileId}
            selectedFile={selectedFile}
            onAssign={onAssign}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryPickerSheet({ selectedFile, onAssign, onDismiss }) {
  if (!selectedFile) return null
  return createPortal(
    <div className="sm:hidden">
      <div className="fixed inset-0 bg-black/30 z-[100]" onClick={onDismiss} />
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl shadow-2xl">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-3" />
        <div className="px-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Assign to category</p>
          <p className="font-semibold text-gray-800 text-sm truncate">{selectedFile.name}</p>
        </div>
        <div className="px-4 pb-8 space-y-0.5 max-h-[55vh] overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const compatible = isFileCompatible(selectedFile, cat)
            const Icon = NO_IMG_ICON[cat.id]
            return (
              <button
                key={cat.id}
                type="button"
                disabled={!compatible}
                onPointerUp={() => compatible && onAssign(cat.id)}
                className={`touch-manipulation w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-colors ${
                  compatible
                    ? 'hover:bg-primary/5 active:bg-primary/10'
                    : 'opacity-35 cursor-not-allowed'
                }`}
              >
                {cat.img ? (
                  <img src={cat.img} alt="" className="w-8 h-8 object-contain opacity-50 flex-shrink-0" />
                ) : Icon ? (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{cat.label}</p>
                  {!compatible && <p className="text-[10px] text-gray-400">STL files only</p>}
                </div>
                {compatible && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function FileDropZone({ value, onChange, uploadProgress }) {
  const [dragActive, setDragActive] = useState(false)
  const [activeDragId, setActiveDragId] = useState(null)
  const [dropError, setDropError] = useState(null)
  const [selectedFileId, setSelectedFileId] = useState(null)
  const inputRef = useRef(null)
  const errorTimer = useRef(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const addFiles = useCallback((rawFiles) => {
    const newItems = Array.from(rawFiles).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      name: f.name,
      type: f.type,
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      category: null,
    }))
    onChange([...value, ...newItems])
  }, [value, onChange])

  const removeFile = useCallback((id) => {
    onChange(value.filter((f) => f.id !== id))
    if (selectedFileId === id) setSelectedFileId(null)
  }, [value, onChange, selectedFileId])

  const showError = (msg) => {
    setDropError(msg)
    clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setDropError(null), 3000)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true) }
  const handleDragLeave = () => setDragActive(false)

  const onDragStart = ({ active }) => {
    setActiveDragId(active.id)
    setSelectedFileId(null)
  }

  const onDragEnd = ({ active, over }) => {
    setActiveDragId(null)
    if (!over) return
    const targetCategory = over.id === 'pool' ? null : over.id
    if (targetCategory) {
      const cat = CATEGORIES.find((c) => c.id === targetCategory)
      const file = value.find((f) => f.id === active.id)
      if (cat && file && !isFileCompatible(file, cat)) {
        showError(`"${file.name}" cannot go here — ${cat.label} only accepts ${cat.accept.join(', ')} files.`)
        return
      }
    }
    onChange(value.map((f) => f.id === active.id ? { ...f, category: targetCategory } : f))
  }

  // Tap-to-assign: fires when a category card is clicked while a pool file is selected
  const assignSelected = (catId) => {
    if (!selectedFileId) return
    const cat = CATEGORIES.find((c) => c.id === catId)
    const file = value.find((f) => f.id === selectedFileId)
    if (cat && file && !isFileCompatible(file, cat)) {
      showError(`"${file.name}" cannot go here — ${cat.label} only accepts ${cat.accept.join(', ')} files.`)
      setSelectedFileId(null)
      return
    }
    onChange(value.map((f) => f.id === selectedFileId ? { ...f, category: catId } : f))
    setSelectedFileId(null)
  }

  const poolFiles = value.filter((f) => !f.category)
  const filesByCategory = (catId) => value.filter((f) => f.category === catId)
  const activeFile = value.find((f) => f.id === activeDragId)
  const selectedFile = value.find((f) => f.id === selectedFileId) || null

  const poolProps = { files: poolFiles, onRemove: removeFile, uploadProgress, selectedFileId, onSelect: setSelectedFileId }
  const catProps  = { filesByCategory, removeFile, uploadProgress, activeFile, selectedFileId, selectedFile, onAssign: assignSelected, onSelect: setSelectedFileId }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
              <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Drop all files here or <span className="text-primary">browse</span></p>
            <p className="text-sm text-gray-400 mt-1">Photos, X-rays, STL scans, PDFs — all at once</p>
            <p className="text-xs text-gray-400 mt-0.5">Accepted: JPG, PNG, HEIC, PDF, STL</p>
          </div>
          {value.length > 0 && (
            <p className="text-sm text-primary font-medium">{value.length} file{value.length !== 1 ? 's' : ''} selected</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.stl"
          className="hidden"
          onChange={(e) => { if (e.target.files.length) addFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* Categorization UI */}
      {value.length > 0 && (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              {selectedFileId
                ? <span className="text-primary font-semibold">File selected — tap a category card to assign it.</span>
                : <>Drag to a category, or <span className="font-semibold text-gray-700">tap a file</span> then tap a category card.</>
              }
            </p>

            {dropError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {dropError}
              </div>
            )}

            {/*
              Desktop: sticky pool sidebar on the left, category grids on the right.
              Mobile: pool above categories; tap-to-assign is the primary interaction.
            */}
            <div className="flex gap-4 items-start">

              {/* Sticky sidebar — desktop (sm+) only */}
              <div className="hidden sm:block w-44 flex-shrink-0 sticky top-[88px] self-start">
                <UntaggedPool {...poolProps} compact />
              </div>

              {/* Category grids */}
              <div className="flex-1 min-w-0 space-y-4">

                {/* Pool above categories on mobile */}
                <div className="sm:hidden">
                  <UntaggedPool {...poolProps} />
                </div>

                <CatGroup label="Photos"   cols="grid-cols-2 sm:grid-cols-3" cats={PHOTO_CATEGORIES} {...catProps} />
                <CatGroup label="X-rays"   cols="grid-cols-2" cats={XRAY_CATEGORIES}  {...catProps} />
                <CatGroup label="3D Scans" cols="grid-cols-2" cats={SCAN_CATEGORIES}  {...catProps} />
                <CatGroup label="Other"    cols="grid-cols-1" cats={OTHER_CATEGORIES} {...catProps} />
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeFile ? (
              <Thumb
                file={activeFile}
                progress={uploadProgress?.[activeFile.id]}
                style={{ opacity: 0.9, transform: 'scale(1.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              />
            ) : null}
          </DragOverlay>

          <CategoryPickerSheet
            selectedFile={selectedFile}
            onAssign={assignSelected}
            onDismiss={() => setSelectedFileId(null)}
          />
        </DndContext>
      )}
    </div>
  )
}

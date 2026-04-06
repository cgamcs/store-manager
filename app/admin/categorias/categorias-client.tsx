"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  LayoutGrid,
  Percent,
  Package,
  TrendingUp,
} from "lucide-react"
import { createCategory, updateCategory, deleteCategory, type CategoriaDB } from "./actions"

// ─── Form ─────────────────────────────────────────────────────────────────────
// Defined OUTSIDE the page component to prevent re-mounts on every render.

type CategoriaFormData = {
  nombre: string
  margen_ganancia: number
}

function CategoriaForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isPending = false,
}: {
  formData: CategoriaFormData
  setFormData: (data: CategoriaFormData) => void
  isEdit?: boolean
  onSubmit: () => void
  isPending?: boolean
}) {
  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="categoria-nombre" className="text-foreground font-medium">
          Nombre de la categoría
        </Label>
        <Input
          id="categoria-nombre"
          placeholder="Ej: Abarrotes, Lácteos, Bebidas…"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria-margen" className="text-foreground font-medium">
          Porcentaje de ganancia
        </Label>
        <div className="relative">
          <Input
            id="categoria-margen"
            type="number"
            min="0"
            max="999"
            step="0.01"
            placeholder="35"
            value={formData.margen_ganancia || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                margen_ganancia: parseFloat(e.target.value) || 0,
              })
            }
            className="h-11 rounded-xl pr-10"
          />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        <p className="text-xs text-muted-foreground">
          Este margen se aplica automáticamente al calcular el precio de venta sugerido.
        </p>
      </div>

      <Button
        className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground mt-2"
        onClick={onSubmit}
        disabled={!formData.nombre.trim() || formData.margen_ganancia <= 0 || isPending}
      >
        {isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Agregar Categoría"}
      </Button>
    </div>
  )
}

// ─── Client ───────────────────────────────────────────────────────────────────

const EMPTY_FORM: CategoriaFormData = { nombre: "", margen_ganancia: 0 }

export default function CategoriasClient({
  initialCategorias,
}: {
  initialCategorias: CategoriaDB[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categorias, setCategorias] = useState<CategoriaDB[]>(initialCategorias)
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaDB | null>(null)
  const [formData, setFormData] = useState<CategoriaFormData>(EMPTY_FORM)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Sync state when server re-renders with fresh data (after revalidatePath)
  useEffect(() => {
    setCategorias(initialCategorias)
  }, [initialCategorias])

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredCategorias = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const avgMargen =
    categorias.length > 0
      ? categorias.reduce((acc, c) => acc + c.margen_ganancia, 0) / categorias.length
      : 0

  const topCategoria = categorias.reduce<CategoriaDB | null>((top, c) => {
    if (!top) return c
    return c.productCount > top.productCount ? c : top
  }, null)

  // ── Handlers ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setCreateError(null)
  }

  const handleCreate = () => {
    setCreateError(null)
    startTransition(async () => {
      const result = await createCategory(formData)
      if (result.error) {
        setCreateError(result.error)
        return
      }
      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    })
  }

  const openEditDialog = (categoria: CategoriaDB) => {
    setSelectedCategoria(categoria)
    setFormData({ nombre: categoria.nombre, margen_ganancia: categoria.margen_ganancia })
    setIsEditDialogOpen(true)
  }

  const handleEdit = () => {
    if (!selectedCategoria) return
    setEditError(null)
    startTransition(async () => {
      const result = await updateCategory({ id: selectedCategoria.id, ...formData })
      if (result.error) {
        setEditError(result.error)
        return
      }
      setIsEditDialogOpen(false)
      setSelectedCategoria(null)
      resetForm()
      router.refresh()
    })
  }

  const openDeleteDialog = (categoria: CategoriaDB) => {
    setSelectedCategoria(categoria)
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!selectedCategoria) return
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteCategory(selectedCategoria.id)
      if (result.error) {
        setDeleteError(result.error)
        return
      }
      setIsDeleteDialogOpen(false)
      setSelectedCategoria(null)
      router.refresh()
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header ─ search + create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11 rounded-xl bg-card border-border/50"
          />
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Agregar Categoría
              </DialogTitle>
            </DialogHeader>
            {createError && (
              <p className="text-sm text-destructive mt-2">{createError}</p>
            )}
            <CategoriaForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            resetForm()
            setSelectedCategoria(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Editar Categoría
            </DialogTitle>
          </DialogHeader>
          {editError && (
            <p className="text-sm text-destructive mt-2">{editError}</p>
          )}
          <CategoriaForm
            formData={formData}
            setFormData={setFormData}
            isEdit
            onSubmit={handleEdit}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar categoría
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría &quot;
              {selectedCategoria?.nombre}&quot;? Los productos asociados quedarán
              sin categoría asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive mb-2">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{categorias.length}</p>
              <p className="text-sm text-muted-foreground">Total categorías</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.6_0.15_145)]/20 to-[oklch(0.6_0.15_145)]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[oklch(0.5_0.15_145)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgMargen.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Margen promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.65_0.18_35)]/20 to-[oklch(0.65_0.18_35)]/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-[oklch(0.55_0.18_35)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground truncate max-w-35">
                {topCategoria?.nombre ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                Con más productos ({topCategoria?.productCount ?? 0})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="rounded-2xl border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-foreground">Catálogo de Categorías</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="pl-6 text-muted-foreground font-medium">Nombre</TableHead>
                <TableHead className="text-muted-foreground font-medium">Margen de ganancia</TableHead>
                <TableHead className="text-muted-foreground font-medium">Productos</TableHead>
                <TableHead className="text-center text-muted-foreground font-medium pr-6">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategorias.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No se encontraron categorías.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategorias.map((categoria) => (
                  <TableRow
                    key={categoria.id}
                    className="border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    {/* Nombre */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                          <LayoutGrid className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                          {categoria.nombre}
                        </span>
                      </div>
                    </TableCell>

                    {/* Margen */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold bg-[oklch(0.6_0.15_145)]/10 text-[oklch(0.45_0.15_145)]">
                          <Percent className="w-3 h-3" />
                          {categoria.margen_ganancia}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Productos asociados */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="w-4 h-4 shrink-0" />
                        <span>
                          {categoria.productCount}{" "}
                          {categoria.productCount === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-4 pr-6">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg h-8 w-8"
                          onClick={() => openEditDialog(categoria)}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteDialog(categoria)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

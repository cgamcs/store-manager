import { Ellipsis, Tags } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EditCategory from "@/components/categories/EditCategory"
import { DeleteCategoryModal } from "@/components/categories/DeleteCategoryModal"

type CategoryDetailsProps = {
  category: {
    id: number
    name: string
    description: string
    color: string
  }
}

function CategoryDetails({category} : CategoryDetailsProps) {
  return (
    <>
      <div className='bg-claro-primario p-5 rounded-lg border border-borde'>
        <div className="flex gap-2">
          <div className={`bg-[${category.color}]/30 p-3 rounded-md`} >
            <Tags className={`text-[${category.color}]`} />
          </div>
          <div className="flex justify-between align-items w-full">
            <div className="flex flex-col justify-between">
              <p className={`text-[${category.color}]`}>{category.name}</p>
              <span className="text-gray-400 text-xs">{2 + category.id}</span>
            </div>

            <div className="flex align-items gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Ellipsis />
                </PopoverTrigger>
                <PopoverContent align="end">
                  <div className="flex flex-col">
                    <EditCategory category={category} />

                    <DeleteCategoryModal category={category} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoryDetails
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, X } from "lucide-react"

export function VariantBuilder({
  options,
  setOptions,
  variants,
  setVariants,
}: {
  options: any[]
  setOptions: (options: any[]) => void
  variants: any[]
  setVariants: (variants: any[]) => void
}) {
  const addOption = () => {
    setOptions([...options, { name: "", values: [""] }])
  }

  const removeOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options]
    newOptions[index].name = name
    setOptions(newOptions)
  }

  const updateOptionValue = (optIndex: number, valIndex: number, value: string) => {
    const newOptions = [...options]
    newOptions[optIndex].values[valIndex] = value
    setOptions(newOptions)
  }

  const addOptionValue = (optIndex: number) => {
    const newOptions = [...options]
    newOptions[optIndex].values.push("")
    setOptions(newOptions)
  }

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    const newOptions = [...options]
    newOptions[optIndex].values.splice(valIndex, 1)
    setOptions(newOptions)
  }

  const generateVariants = () => {
    const validOptions = options.filter((o) => o.name && o.values.some((v: string) => v))
    if (validOptions.length === 0) {
      setVariants([])
      return
    }

    // Cartesian product
    const generate = (opts: any[], current: any = {}): any[] => {
      if (opts.length === 0) return [current]
      const [head, ...tail] = opts
      const validVals = head.values.filter((v: string) => v)
      if (validVals.length === 0) return generate(tail, current)
      
      const result: any[] = []
      for (const val of validVals) {
        result.push(...generate(tail, { ...current, [head.name]: val }))
      }
      return result
    }

    const combinations = generate(validOptions)
    
    // Merge with existing variants to preserve price/stock
    const newVariants = combinations.map(comb => {
      const existing = variants.find(v => JSON.stringify(v.option_values) === JSON.stringify(comb))
      return existing || {
        sku: "",
        price: 0,
        stock_quantity: 0,
        option_values: comb
      }
    })
    
    setVariants(newVariants)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {options.map((option, oIdx) => (
          <div key={oIdx} className="rounded-md border p-4 space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 text-muted-foreground"
              onClick={() => removeOption(oIdx)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="w-1/3">
              <label className="text-sm font-medium">Option Name</label>
              <Input
                placeholder="e.g. Size"
                value={option.name}
                onChange={(e) => updateOptionName(oIdx, e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Option Values</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {option.values.map((val: string, vIdx: number) => (
                  <div key={vIdx} className="flex items-center gap-1">
                    <Input
                      className="w-32"
                      placeholder="Value"
                      value={val}
                      onChange={(e) => updateOptionValue(oIdx, vIdx, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOptionValue(oIdx, vIdx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addOptionValue(oIdx)}>
                  <Plus className="mr-1 h-3 w-3" /> Add Value
                </Button>
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={addOption}>
            <Plus className="mr-2 h-4 w-4" /> Add Option
          </Button>
          <Button type="button" onClick={generateVariants} className="bg-gold text-black hover:bg-gold-bright">
            Generate Variants
          </Button>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price (Override)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, vIdx) => (
                <TableRow key={vIdx}>
                  <TableCell className="font-medium">
                    {Object.values(variant.option_values).join(" / ")}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.sku}
                      onChange={(e) => {
                        const v = [...variants]
                        v[vIdx].sku = e.target.value
                        setVariants(v)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => {
                        const v = [...variants]
                        v[vIdx].price = parseFloat(e.target.value) || 0
                        setVariants(v)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) => {
                        const v = [...variants]
                        v[vIdx].stock_quantity = parseInt(e.target.value) || 0
                        setVariants(v)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const v = [...variants]
                      v.splice(vIdx, 1)
                      setVariants(v)
                    }}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

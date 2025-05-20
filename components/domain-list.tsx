"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

export function DomainList() {
  const [copied, setCopied] = useState<string | null>(null)
  const [currentDomain, setCurrentDomain] = useState("")
  const [otherDomains, setOtherDomains] = useState<string[]>([])
  const [newDomain, setNewDomain] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get current domain
      setCurrentDomain(window.location.hostname)

      // Get previously saved domains from localStorage
      try {
        const savedDomains = localStorage.getItem("authDomains")
        if (savedDomains) {
          setOtherDomains(JSON.parse(savedDomains))
        } else {
          // Initialize with common domains if none saved
          const initialDomains = ["localhost", "127.0.0.1"]
          setOtherDomains(initialDomains)
          localStorage.setItem("authDomains", JSON.stringify(initialDomains))
        }
      } catch (error) {
        console.error("Error loading saved domains:", error)
      }
    }
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)

    toast({
      title: "Copied!",
      description: "Domain copied to clipboard",
    })

    setTimeout(() => setCopied(null), 2000)
  }

  const addDomain = () => {
    if (!newDomain.trim()) return

    // Don't add duplicates
    if (otherDomains.includes(newDomain.trim()) || newDomain.trim() === currentDomain) {
      toast({
        title: "Domain Already Exists",
        description: "This domain is already in the list",
        variant: "destructive",
      })
      return
    }

    const updatedDomains = [...otherDomains, newDomain.trim()]
    setOtherDomains(updatedDomains)
    setNewDomain("")

    // Save to localStorage
    localStorage.setItem("authDomains", JSON.stringify(updatedDomains))

    toast({
      title: "Domain Added",
      description: "New domain added to the list",
    })
  }

  const removeDomain = (index: number) => {
    const updatedDomains = [...otherDomains]
    updatedDomains.splice(index, 1)
    setOtherDomains(updatedDomains)

    // Save to localStorage
    localStorage.setItem("authDomains", JSON.stringify(updatedDomains))

    toast({
      title: "Domain Removed",
      description: "Domain removed from the list",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authorized Domains</CardTitle>
        <CardDescription>
          Add these domains to your Firebase Console under Authentication → Settings → Authorized domains
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Current Domain:</h3>
          <div className="flex items-center">
            <div className="border rounded-l-md p-2 bg-muted flex-1 font-mono text-sm truncate">{currentDomain}</div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-l-none border-y border-r h-9"
              onClick={() => copyToClipboard(currentDomain, "current")}
            >
              {copied === "current" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Domains to Authorize:</h3>
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Add domain..."
                className="h-8 text-sm"
              />
              <Button size="sm" variant="outline" onClick={addDomain}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ul className="space-y-2 mt-2">
            {otherDomains.map((domain, index) => (
              <li key={index} className="flex items-center">
                <div className="border rounded-l-md p-2 bg-muted flex-1 font-mono text-sm truncate">{domain}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none border-y h-9"
                  onClick={() => copyToClipboard(domain, `domain-${index}`)}
                >
                  {copied === `domain-${index}` ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-l-none border-y border-r h-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeDomain(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="pt-2 text-sm text-muted-foreground">
            <p>Add all relevant domains including preview environments to ensure authentication works everywhere.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const getInitials = (fullName: string | undefined): string => {
  if (!fullName) return ""
  fullName = fullName.trim()
  if (!fullName) return ""
  const initialsDraft = fullName
    .split(" ")
    .map((word) => word && word[0].toUpperCase())
    .join("")
  return initialsDraft.replace("-", "").replace("_", "").substring(0, 3)
}

export default async function Page(props: PageProps<'/listing/[id]'>) {
  const { id } = await props.params

  return <h1>Product Detail Page</h1>
}

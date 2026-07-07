import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/products'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'

const route = getRouteApi('/_authenticated/products/')

export function Products() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  return (
    <ProductsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>产品管理</h2>
            <p className='text-muted-foreground'>
              按 品牌 → 系列 → SKU 的层级维护产品主数据与规格属性。
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        <ProductsTable data={products} search={search} navigate={navigate} />
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  )
}

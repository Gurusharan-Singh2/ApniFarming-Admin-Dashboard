
import { Home, Inbox, CalendarSearch, Search, Settings, User2, ChevronUp, Plus, Projector, ChevronDown, ListOrderedIcon, CastleIcon } from 'lucide-react'

import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from './ui/sidebar'
import Link from 'next/link'
import Image from 'next/image'
import logo from '../../public/logo.png'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

const items=[
  {
    title:"Home",
    url:"/",
    icon:Home
  },
  {
    title:"Orders",
    url:"/orders",
    icon:ListOrderedIcon
  },
  {
    title:"Inbox",
    url:"#",
    icon:Inbox
  },
  {
    title:"Calender",
    url:"#",
    icon:CalendarSearch
  },
  {
    title:"Search",
    url:"#",
    icon:Search
  },
  {
    title:"Setting",
    url:"#",
    icon:Settings
  },
 
]

const AppSideBar = () => {
  return (
   <Sidebar collapsible='icon' side='left'>
    <SidebarHeader className='py-3 '>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href='/' className='text-2xl'>
            <Image src={logo} width={20} height={20} alt=''/>
            <span>Apni Farming</span>

            
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
      <SidebarSeparator/>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel >Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item,index)=>(
              <SidebarMenuItem key={index}>
               <SidebarMenuButton asChild>
                <Link href={item.url}>{<item.icon/>} <span>{item.title}</span></Link>

               </SidebarMenuButton>
               {item.title==="Inbox" && (
                <SidebarMenuBadge>20</SidebarMenuBadge>
               )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    <Collapsible defaultOpen className="group/collapsible">
     <SidebarGroup>
        <SidebarGroupLabel asChild>
           <CollapsibleTrigger>
           Products
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          </SidebarGroupLabel>
       <CollapsibleContent>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild><Link href={'/all-products'}><Projector/> See All Product</Link></SidebarMenuButton>
                <SidebarMenuButton asChild><Link href={'/add-product'}><Plus/> Add Product</Link></SidebarMenuButton>
            
            
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
       </CollapsibleContent>
       
      </SidebarGroup>
    </Collapsible>
    <Collapsible defaultOpen className="group/collapsible">
     <SidebarGroup>
        <SidebarGroupLabel asChild>
           <CollapsibleTrigger>
           Categories
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          </SidebarGroupLabel>
       <CollapsibleContent>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild><Link href={'/all-categories'}><CastleIcon/> See All Categories</Link></SidebarMenuButton>
                <SidebarMenuButton asChild><Link href={'/add-category'}><Plus/> Add Category</Link></SidebarMenuButton>
            
            
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
       
       </CollapsibleContent>
       
      </SidebarGroup>
    </Collapsible>
    <Collapsible defaultOpen className="group/collapsible">
     <SidebarGroup>
        <SidebarGroupLabel asChild>
           <CollapsibleTrigger>
           Bannners
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          </SidebarGroupLabel>
       <CollapsibleContent>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild><Link href={'/all-banners'}><CastleIcon/> See All Banners</Link></SidebarMenuButton>
                <SidebarMenuButton asChild><Link href={'/add-banner'}><Plus/> Add Banner</Link></SidebarMenuButton>


            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
       
      
       </CollapsibleContent>
       
      </SidebarGroup>
    </Collapsible>
    <Collapsible defaultOpen className="group/collapsible">
     <SidebarGroup>
        <SidebarGroupLabel asChild>
           <CollapsibleTrigger>
           Manage Orders
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
          </SidebarGroupLabel>
       <CollapsibleContent>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                
                <SidebarMenuButton asChild><Link href={'/create-order'}><Plus/> Create new Order</Link></SidebarMenuButton>


            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
       
      
       </CollapsibleContent>
       
      </SidebarGroup>
    </Collapsible>
     

    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
             <SidebarMenuButton>
              <User2/> Mandeep Singh < ChevronUp className='ml-auto'/>
             </SidebarMenuButton>
           
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>Account </DropdownMenuItem>
              <DropdownMenuItem>Setting</DropdownMenuItem>
              <DropdownMenuItem>Sign Out</DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
   </Sidebar>
  )
}

export default AppSideBar
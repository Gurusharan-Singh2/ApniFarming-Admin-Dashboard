"use client"
import { Home, Inbox, CalendarSearch, Search, Settings, User2, ChevronUp, Plus, Projector, ChevronDown, ListOrderedIcon, CastleIcon ,UserLock, UserRoundPlus} from 'lucide-react'
import { UserRound } from 'lucide-react';
import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from './ui/sidebar'
import Link from 'next/link'
import Image from 'next/image'
import logo from '../../public/logo.png'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { useSidebar } from './ui/sidebar'

const items=[
  { title:"Home", url:"/", icon:Home },
  { title:"Orders", url:"/orders", icon:ListOrderedIcon },
  { title:"Driver-Assign", url:"/driver-assign", icon:UserLock },
  { title:"Calender", url:"#", icon:CalendarSearch },
  { title:"Search", url:"#", icon:Search },
  { title:"Setting", url:"#", icon:Settings },
]

const AppSideBar = () => {
  const { closeSidebar } = useSidebar() // get closeSidebar method

  const handleLinkClick = () => {
    if (window.innerWidth < 768) { // mobile breakpoint
      closeSidebar()
    }
  }

  return (
   <Sidebar collapsible='icon' side='left'>
    <SidebarHeader className='py-3'>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href='/' className='text-2xl' onClick={handleLinkClick}>
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
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item,index)=>(
              <SidebarMenuItem key={index}>
               <SidebarMenuButton asChild>
                <Link href={item.url} onClick={handleLinkClick}>
                  {<item.icon/>} <span>{item.title}</span>
                </Link>
               </SidebarMenuButton>
               {item.title==="Inbox" && <SidebarMenuBadge>20</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Collapsible sections */}
      {[
        { label: "Products", links: [{ title: "See All Product", url: "/all-products", icon: Projector }, { title: "Add Product", url: "/add-product", icon: Plus }] },
        { label: "Categories", links: [{ title: "See All Categories", url: "/all-categories", icon: CastleIcon }, { title: "Add Category", url: "/add-category", icon: Plus }] },
        { label: "Bannners", links: [{ title: "See All Banners", url: "/all-banners", icon: CastleIcon }, { title: "Add Banner", url: "/add-banner", icon: Plus }] },
        { label: "Manage Orders", links: [{ title: "Create new Order", url: "/create-order", icon: Plus }] },
        { label: "Manage Driver", links: [{ title: "See All Driver", url: "/all-driver", icon: UserRound },{ title: "Add Driver", url: "/add-driver", icon: UserRoundPlus }] },
      ].map((section, idx) => (
        <Collapsible defaultOpen key={idx} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                {section.label}
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarContent>
                <SidebarMenu>
                  {section.links.map((link, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton asChild>
                        <Link href={link.url} onClick={handleLinkClick}>
                          <link.icon /> {link.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}

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

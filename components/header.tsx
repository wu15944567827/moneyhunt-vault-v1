"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

// 导航项配置 - 按官网顺序，项目库在风向标左边
const NAV_ITEMS = [
  { href: "/", label: "首页", external: true },
  { href: "/groupV2", label: "小组", external: true },
  { href: "/", label: "项目库", external: false, isProjectLibrary: true },
  { href: "/opportunity", label: "风向标", external: true },
  { href: "/square", label: "生财广场", external: true },
  { href: "/activity", label: "航海实战", external: true },
  { href: "/meeting", label: "线下聚会", external: true },
]

// 航海家图标 - 与官网一致
function VoyagerIcon() {
  return (
    <svg className="w-[22px] h-[22px] mr-1" viewBox="0 0 22 22" fill="none">
      <path d="M11.0029 2C13.3899 2 15.6794 2.94792 17.3672 4.63574C19.055 6.32357 20.0029 8.61305 20.0029 11C20.0029 13.3869 19.055 15.6764 17.3672 17.3643C15.6794 19.0521 13.3899 20 11.0029 20C8.61598 20 6.3265 19.0521 4.63867 17.3643C2.95084 15.6764 2.00293 13.3869 2.00293 11C2.00293 8.61305 2.95084 6.32357 4.63867 4.63574C6.3265 2.94791 8.61598 2 11.0029 2ZM11.0029 2.73926C8.81221 2.73928 6.71127 3.60924 5.16211 5.1582C3.6129 6.70742 2.74219 8.80908 2.74219 11C2.74223 13.1909 3.61293 15.2916 5.16211 16.8408C6.7113 18.39 8.81206 19.2607 11.0029 19.2607C13.1938 19.2607 15.2955 18.39 16.8447 16.8408C18.3937 15.2917 19.2636 13.1907 19.2637 11C19.2637 8.8091 18.3939 6.70741 16.8447 5.1582C15.2955 3.60899 13.1938 2.73926 11.0029 2.73926ZM11.0029 3.49609C13.0063 3.49616 14.9281 4.29242 16.3447 5.70898C17.7614 7.12562 18.5575 9.04737 18.5576 11.0508C18.5576 12.0426 18.3619 13.025 17.9824 13.9414C17.6028 14.8578 17.0461 15.6912 16.3447 16.3926C15.6434 17.0938 14.8108 17.6507 13.8945 18.0303C12.9781 18.4099 11.9949 18.6045 11.0029 18.6045C10.0111 18.6044 9.02868 18.4098 8.1123 18.0303C7.19577 17.6506 6.36262 17.0941 5.66113 16.3926C4.95973 15.6911 4.40403 14.8579 4.02441 13.9414C3.64486 13.025 3.44924 12.0427 3.44922 11.0508C3.44931 9.04751 4.24469 7.12559 5.66113 5.70898C7.07773 4.29255 8.99968 3.4962 11.0029 3.49609ZM11.1016 5.5C10.0543 5.44827 9.26875 6.23222 9.26855 7.1748C9.26861 7.90598 9.68659 8.42902 10.2637 8.79688V9.21289H7.80762V10.626H10.3193V14.7607C7.80743 14.603 5.97755 12.0909 5.92578 11.2539C5.92578 11.0965 5.92563 10.9383 6.08301 10.7832L6.39844 10.5732L4.9834 9.31934C4.8779 14.8117 9.22078 16.1194 10.3193 16.4346L11.1035 17.3232L11.7842 16.5391C13.2986 16.2262 17.274 14.8143 17.2217 9.32227L17.2236 9.32129H17.2227L17.2217 9.32227L15.9697 10.5752L16.2314 10.7861C16.3888 10.8906 16.2318 11.0481 16.2314 11.2559C16.2314 12.0928 14.6616 14.6041 11.7852 14.7617V10.6279H14.2451V9.2168H11.7305V8.84863C12.4109 8.5336 12.9335 7.90701 12.9336 7.22656C12.9334 6.18061 12.0441 5.50012 11.1016 5.5ZM10.998 6.3916C11.3657 6.39175 11.7302 6.70703 11.7305 7.07129C11.7304 7.43904 11.4151 7.80356 10.999 7.80371C10.5806 7.85646 10.2656 7.59406 10.2656 7.17676C10.2659 6.75625 10.6315 6.39164 10.998 6.3916Z" fill="url(#paint0_linear_1689_3795)"/>
      <defs>
        <linearGradient id="paint0_linear_1689_3795" x1="11.0029" y1="2" x2="11.0029" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BABFC5"/>
          <stop offset="1" stopColor="#828995"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// 深海圈图标 - 与官网一致
function CommunityIcon() {
  return (
    <svg className="w-[22px] h-[22px] mr-1" viewBox="0 0 22 22" fill="none">
      <path d="M10.9961 2C15.9667 2 19.9961 6.02944 19.9961 11C19.9961 15.9706 15.9667 20 10.9961 20C6.02553 20 1.99609 15.9706 1.99609 11C1.99609 6.02944 6.02553 2 10.9961 2ZM10.9961 2.7998C6.46736 2.7998 2.7959 6.47126 2.7959 11C2.7959 15.5287 6.46736 19.2002 10.9961 19.2002C15.5248 19.2002 19.1963 15.5287 19.1963 11C19.1963 6.47126 15.5248 2.7998 10.9961 2.7998ZM11 3.5C15.1368 3.5 18.5 6.86429 18.5 11C18.5 15.1346 15.1368 18.5 11 18.5C6.86536 18.5 3.5 15.1357 3.5 11C3.5 6.86429 6.86536 3.5 11 3.5ZM14.4307 7.18945L9.71191 8.7627C9.26401 8.912 8.912 9.26401 8.7627 9.71191L7.18945 14.4307C7.11128 14.6652 7.33481 14.8887 7.56934 14.8105L12.2881 13.2373C12.736 13.088 13.088 12.736 13.2373 12.2881L14.8105 7.56934C14.8887 7.33481 14.6652 7.11128 14.4307 7.18945ZM11.001 9.92871C11.1417 9.92871 11.2811 9.9569 11.4111 10.0107C11.541 10.0646 11.6594 10.1428 11.7588 10.2422C11.8582 10.3416 11.9374 10.4599 11.9912 10.5898C12.045 10.7198 12.0722 10.8593 12.0723 11C12.0723 11.2842 11.9597 11.5569 11.7588 11.7578C11.5579 11.9587 11.2851 12.0713 11.001 12.0713C10.7169 12.0713 10.4441 11.9587 10.2432 11.7578C10.0423 11.5569 9.92969 11.2841 9.92969 11C9.92971 10.8593 9.95789 10.7198 10.0117 10.5898C10.0656 10.46 10.1438 10.3416 10.2432 10.2422C10.3426 10.1428 10.461 10.0646 10.5908 10.0107C10.7208 9.95692 10.8603 9.92873 11.001 9.92871Z" fill="url(#paint0_linear_community)"/>
      <defs>
        <linearGradient id="paint0_linear_community" x1="10.9961" y1="2" x2="10.9961" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BABFC5"/>
          <stop offset="1" stopColor="#828995"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// 搜索图标 - 与官网一致
function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip0_868_2779)">
        <path d="M7.0026 12.6673C10.1322 12.6673 12.6693 10.1303 12.6693 7.00065C12.6693 3.87105 10.1322 1.33398 7.0026 1.33398C3.873 1.33398 1.33594 3.87105 1.33594 7.00065C1.33594 10.1303 3.873 12.6673 7.0026 12.6673Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M11.0703 11.0742L13.8987 13.9027" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_868_2779">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}

// 通知图标 - 与官网一致
function NotificationIcon() {
  return (
    <svg className="w-[21px] h-5" viewBox="0 0 21 20" fill="none">
      <path d="M17.0939 13.9336C17.2579 13.9258 17.42 13.9688 17.5587 14.0586C16.9942 13.6973 16.6524 13.0742 16.6544 12.4023V8.51562C16.6544 5.66602 14.5899 3.28906 11.8321 2.70508V2.56445C11.8321 1.83984 11.2442 1.25391 10.5196 1.25391H10.5177C9.79307 1.25391 9.20323 1.8418 9.20323 2.56641V2.70312C6.44346 3.28906 4.38096 5.66406 4.38096 8.51562V12.4043C4.38096 13.1016 4.01768 13.7109 3.47471 14.0605C3.61143 13.9707 3.77549 13.9258 3.93956 13.9355C3.45713 13.918 3.05088 14.2949 3.03331 14.7773C3.01573 15.2598 3.39268 15.666 3.8751 15.6836H17.0899C17.5724 15.6855 17.9649 15.293 17.9669 14.8105C17.9689 14.3262 17.5782 13.9336 17.0939 13.9336ZM10.5196 18.7461C11.7306 18.7461 12.711 17.7656 12.711 16.5605H8.32627C8.32627 17.7656 9.30674 18.7461 10.5196 18.7461Z" fill="#838D99"/>
    </svg>
  )
}

// AI问答图标 - 与官网一致的渐变方块
function AIIcon() {
  return (
    <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]" />
  )
}

export function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
  const pathname = usePathname()
  const isProjectLibrary = pathname === "/" || pathname.startsWith("/project")

  // 官网基础URL
  const SCYS_BASE = "https://www.shengcaiyoushu.com"

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-[1400px] mx-auto h-14 flex items-center px-6">
        {/* Logo */}
        <a href={SCYS_BASE} className="flex items-center shrink-0 mr-8">
          <img
            src="/scys-logo.png"
            alt="生财有术"
            className="h-6 w-auto"
          />
        </a>

        {/* 导航Tab容器 */}
        <nav className="flex items-center h-14">
          {NAV_ITEMS.map((item) => {
            const isActive = item.isProjectLibrary && isProjectLibrary

            if (item.isProjectLibrary) {
              return (
                <a
                  key={item.label}
                  href="/"
                  className={`shrink-0 relative px-4 h-14 flex items-center text-[15px] transition-colors whitespace-nowrap ${
                    isActive ? "text-[#333] font-medium" : "text-[#333] hover:text-[#000]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[5px] bg-[#58A391]" />
                  )}
                </a>
              )
            }

            return (
              <a
                key={item.label}
                href={`${SCYS_BASE}${item.href}`}
                className="shrink-0 relative px-4 h-14 flex items-center text-[15px] text-[#333] hover:text-[#000] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            )
          })}

          {/* 航海家 - 带图标 */}
          <a
            href={`${SCYS_BASE}/voyager`}
            className="shrink-0 relative px-4 h-14 flex items-center text-[15px] text-[#333] hover:text-[#000] transition-colors whitespace-nowrap"
          >
            <VoyagerIcon />
            <span>航海家</span>
          </a>

          {/* 深海圈 - 带图标 */}
          <a
            href={`${SCYS_BASE}/community`}
            className="shrink-0 relative px-4 h-14 flex items-center text-[15px] text-[#333] hover:text-[#000] transition-colors whitespace-nowrap"
          >
            <CommunityIcon />
            <span>深海圈</span>
          </a>
        </nav>

        {/* 右侧空白 */}
        <div className="flex-1 min-w-4" />

        {/* 搜索框 */}
        <div className="relative shrink-0 mr-4">
          <input
            type="text"
            placeholder="搜索内容、用户、航海..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-[220px] h-8 pl-3 pr-9 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg
                       text-sm text-[#333] placeholder:text-[#999]
                       focus:outline-none focus:bg-white focus:border-[#3B796F]/40
                       transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
            <SearchIcon />
          </div>
        </div>

        {/* AI问答 */}
        <a
          href={`${SCYS_BASE}/ai`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 mr-4 text-[15px] text-[#333] hover:text-[#000] transition-colors whitespace-nowrap"
        >
          <AIIcon />
          <span>AI问答</span>
        </a>

        {/* 通知图标 */}
        <button className="shrink-0 p-2 text-[#838D99] hover:text-[#666] transition-colors mr-2">
          <NotificationIcon />
        </button>

        {/* 用户头像 */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
          <img
            src="https://search01.shengcaiyoushu.com/upload/avatar/FpVoRLIltjIxXtxKbSnLf_pEnbC9"
            alt="头像"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/avatar-placeholder.png'
            }}
          />
        </div>
      </div>
    </header>
  )
}

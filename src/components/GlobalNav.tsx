'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Landmark, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import styles from './GlobalNav.module.css';

interface GlobalNavProps {
  currentDomain?: 'hub' | 'kcti' | 'kisa';
}

export default function GlobalNav({ currentDomain }: GlobalNavProps) {
  const pathname = usePathname();

  const isHub = currentDomain === 'hub' || pathname === '/';
  const isKcti = currentDomain === 'kcti' || pathname.startsWith('/kcti');
  const isKisa = currentDomain === 'kisa' || pathname.startsWith('/kisa');

  return (
    <header className={styles.navHeader}>
      <div className={styles.navContainer}>
        {/* 브랜드 로고 */}
        <Link href="/" className={styles.brandGroup}>
          <div className={styles.brandLogo}>
            <Layers size={20} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>DATATREE AI</span>
            <span className={styles.brandDesc}>공공·특수목적 AI RAG 통합 플랫폼</span>
          </div>
        </Link>

        {/* 도메인 전환 내비게이션 */}
        <nav>
          <ul className={styles.navLinks}>
            <li className={styles.navItem}>
              <Link 
                href="/" 
                className={`${styles.navLink} ${isHub ? styles.navLinkActive : ''}`}
              >
                <Sparkles size={16} />
                <span>통합 솔루션 허브</span>
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link 
                href="/kcti" 
                className={`${styles.navLink} ${isKcti ? styles.navLinkActive : ''}`}
              >
                <Landmark size={16} />
                <span>한국문화관광연구원 (KCTI)</span>
                <span className={`${styles.navBadge} ${styles.navBadgeBlue}`}>연구보고서 RAG</span>
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link 
                href="/kisa" 
                className={`${styles.navLink} ${isKisa ? styles.navLinkActive : ''}`}
              >
                <ShieldCheck size={16} />
                <span>불법스팸대응센터 (KISA)</span>
                <span className={`${styles.navBadge} ${styles.navBadgeGreen}`}>5중 보안 & 소명위저드</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* 우측 시스템 상태 */}
        <div className={styles.navRight}>
          <div className={styles.systemStatus} title="ChromaDB 3072차원 벡터 스토어 & FastAPI 백엔드 정상 가동 중">
            <span className={styles.statusDot}></span>
            <span>듀얼 RAG 엔진 가동 중</span>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Landmark, ShieldCheck, CheckCircle } from 'lucide-react';
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
        {/* 기업 브랜드 로고 */}
        <Link href="/" className={styles.brandGroup}>
          <div className={styles.brandLogo}>
            <Layers size={20} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>DATATREE AI</span>
            <span className={styles.brandDesc}>공공·특수목적 맞춤형 AI 솔루션</span>
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
                <span>솔루션 개요</span>
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link 
                href="/kcti" 
                className={`${styles.navLink} ${isKcti ? styles.navLinkActive : ''}`}
              >
                <Landmark size={15} />
                <span>한국문화관광연구원 (KCTI)</span>
                <span className={`${styles.navBadge} ${styles.navBadgeBlue}`}>과업 실증 PoC</span>
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link 
                href="/kisa" 
                className={`${styles.navLink} ${isKisa ? styles.navLinkActive : ''}`}
              >
                <ShieldCheck size={15} />
                <span>불법스팸대응센터 (KISA)</span>
                <span className={`${styles.navBadge} ${styles.navBadgeGreen}`}>보안 규격 PoC</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* 우측 비즈니스 액션 버튼 */}
        <div className={styles.navRight}>
          <Link href="/#contact" className={styles.ctaBtn}>
            <span>도입 문의 및 제안서 요청</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function DrawnLine({variant='sweep',className=''}){
 const paths={
  sweep:'M 240 20 C 95 120 345 245 230 380 C 105 520 45 340 155 340 C 335 340 350 650 180 775 C 55 875 115 1015 260 1180',
  loop:'M 130 20 C 315 145 310 285 170 405 C 20 530 60 710 215 700 C 345 690 320 515 200 595 C 55 700 115 970 240 1180'
 };
 return <svg className={`drawn-line drawn-line-${variant} ${className}`} data-drawn-line viewBox="0 0 400 1200" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d={paths[variant]||paths.sweep} pathLength="1"/></svg>
}

import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Original vector artwork. No photographed reference pixels are used. */
export const ThoughtfulScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // Logarithmic camera travel keeps the large macro move perceptually smooth.
  const push = interpolate(t, [0.66, 1.88], [0, 1], {
    ...clamp, easing: Easing.bezier(0.48, 0, 0.23, 1),
  });
  const establish = interpolate(t, [0, 0.66], [1, 1.14], {...clamp, easing: Easing.inOut(Easing.quad)});
  const zoom = establish * Math.exp(Math.log(18.67 / 1.14) * push);
  const aim = interpolate(t, [0, 1.82], [0, 1], {...clamp, easing: Easing.bezier(0.35, 0, 0.2, 1)});
  const cx = 960 + (893.5 - 960) * aim;
  const cy = 540 + (423.2 - 540) * aim;
  const breathe = Math.sin(t * Math.PI * 1.1) * 1.1 * (1 - push);
  const blink = interpolate(t, [0, 0.30, 0.36, 0.42, 0.49, 2], [1, 1, 0.08, 0.08, 1, 1], clamp);
  const reflection = interpolate(push, [0.06, 0.52, 0.86], [0.07, 0.80, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#ececea'}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wall" x2="0" y2="1"><stop stopColor="#f4f4f2"/><stop offset="1" stopColor="#e6e7e5"/></linearGradient>
          <linearGradient id="skin" x1="0" y1="0" x2="1" y2="0.6"><stop stopColor="#eac197"/><stop offset="0.58" stopColor="#f1cda8"/><stop offset="1" stopColor="#e8b68f"/></linearGradient>
          <linearGradient id="neck" x2="1" y2="0"><stop stopColor="#ce976f"/><stop offset="1" stopColor="#e9bb91"/></linearGradient>
          <linearGradient id="shirt" x2="1" y2="0.9"><stop stopColor="#4674a5"/><stop offset="1" stopColor="#2e527d"/></linearGradient>
          <linearGradient id="sleeve" x2="0.7" y2="1"><stop stopColor="#365f90"/><stop offset="1" stopColor="#284970"/></linearGradient>
          <linearGradient id="hair" x2="0.8" y2="1"><stop stopColor="#292c34"/><stop offset="1" stopColor="#1e232c"/></linearGradient>
          <linearGradient id="wood" x2="0" y2="1"><stop stopColor="#c99561"/><stop offset="1" stopColor="#b9814f"/></linearGradient>
          <linearGradient id="chair" x2="1" y2="0"><stop stopColor="#a88c70"/><stop offset="1" stopColor="#c0a487"/></linearGradient>
          <linearGradient id="lens" x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#182640"/><stop offset="0.50" stopColor="#151b45"/><stop offset="1" stopColor="#0b102b"/></linearGradient>
          <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="0.65"><stop stopColor="#8295b6" stopOpacity="0.27"/><stop offset="0.45" stopColor="#49577e" stopOpacity="0"/></linearGradient>
          <radialGradient id="screenGlow"><stop stopColor="#e9f9ff" stopOpacity="0.95"/><stop offset="0.5" stopColor="#a4b5ff" stopOpacity="0.65"/><stop offset="1" stopColor="#7077ff" stopOpacity="0"/></radialGradient>
          <filter id="reflectionBlur" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="2.7"/></filter>
          <filter id="softShadow" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
          <clipPath id="nearLens"><rect x="844" y="370" width="94" height="77" rx="19"/></clipPath>
          <clipPath id="farLens"><rect x="954" y="371" width="58" height="71" rx="15"/></clipPath>
        </defs>
        <rect width="1920" height="1080" fill="url(#wall)"/>
        <g transform={`translate(960 540) scale(${zoom}) translate(${-cx} ${-cy})`}>
          {/* Quiet background and chair remain subordinate to the face. */}
          <path d="M0 1024H1920V1080H0Z" fill="#dedfdd"/>
          <rect x="565" y="625" width="112" height="455" rx="44" fill="url(#chair)"/>
          <path d="M595 1070V1150M650 1070V1150" stroke="#4a4641" strokeWidth="18"/>
          <g transform={`translate(0 ${breathe})`}>
            {/* Torso and far arm: adult shoulder width, connected neck and shoulder girdle. */}
            <path d="M739 623Q689 636 672 703L651 1011Q649 1047 676 1065L729 1073L758 751Z" fill="#294d78"/>
            <path d="M778 611Q698 609 662 661Q644 696 650 750L677 1087H987L960 748Q950 676 907 644L877 620Z" fill="url(#shirt)"/>
            <path d="M708 752Q696 877 718 1046" stroke="#264a72" strokeWidth="5" opacity="0.35" fill="none"/>
            <path d="M831 517L820 612Q830 635 853 642Q880 639 900 625L896 536Z" fill="url(#neck)"/>
            <path d="M808 614Q835 645 858 646Q883 640 898 626" fill="none" stroke="#294d76" strokeWidth="10" strokeLinecap="round"/>
            {/* A slightly foreshortened adult head; its eyes remain halfway down the skull. */}
            <g transform="translate(925 560) scale(0.9) translate(-925 -560)">
            <path d="M783 335Q797 274 876 268Q951 262 984 322Q999 353 995 397L995 420Q999 443 994 465Q993 497 977 520L950 551Q939 562 922 562Q902 562 881 551L845 529Q817 509 803 480L785 445Z" fill="url(#skin)"/>
            <path d="M793 436Q791 480 818 510Q839 533 868 545Q837 513 827 475Z" fill="#d9a47c" opacity="0.35"/>
            <path d="M789 421Q770 402 765 422Q759 441 773 462Q781 476 795 468L807 452L806 428Z" fill="#e4b38a"/>
            <path d="M785 426Q773 416 773 432Q772 443 783 448L780 455" fill="none" stroke="#be8867" strokeWidth="3.2" strokeLinecap="round"/>
            <path d="M778 441Q756 418 761 366Q758 311 796 275Q832 237 887 241Q946 239 978 280Q999 306 999 344Q961 319 914 321Q872 320 836 337Q824 362 820 392L807 435L794 447L793 426Z" fill="url(#hair)"/>
            <path d="M790 327Q815 276 875 267Q922 260 957 286" stroke="#3b3e46" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.45"/>
            {/* Brows follow the orbital arches, eyes converge gently on the monitor. */}
            {/* Asymmetric brows: one lifted in questioning, the other drawn toward the bridge. */}
            <path d="M849 352Q868 330 887 336Q899 339 907 347" fill="none" stroke="#343039" strokeWidth="6" strokeLinecap="round"/>
            <path d="M960 365Q976 351 995 355" fill="none" stroke="#343039" strokeWidth="5.5" strokeLinecap="round"/>
            <g transform={`translate(0 405) scale(1 ${blink}) translate(0 -405)`}>
              <path d="M859 405Q878 390 898 405Q879 419 859 405" fill="#fff6eb"/>
              <ellipse cx="884" cy="405" rx="8" ry="10" fill="#665142"/>
              <ellipse cx="886" cy="405" rx="4.5" ry="7" fill="#262b35"/>
              <circle cx="888" cy="402" r="2" fill="#fff"/>
              <path d="M859 405Q878 391 898 405" fill="none" stroke="#584038" strokeWidth="3" strokeLinecap="round"/>
              <path d="M963 404Q977 393 990 405Q977 415 963 404" fill="#fff6eb"/>
              <ellipse cx="980" cy="404" rx="6" ry="8" fill="#665142"/>
              <ellipse cx="982" cy="404" rx="3.5" ry="6" fill="#262b35"/>
              <circle cx="983" cy="401" r="1.5" fill="#fff"/>
              <path d="M963 404Q977 393 990 405" fill="none" stroke="#584038" strokeWidth="2.8" strokeLinecap="round"/>
            </g>
            {/* Nose descends from the bridge between the lenses, not below the far eye. */}
            <path d="M946 402Q943 424 939 442Q936 451 941 455Q948 460 956 454" fill="none" stroke="#c38e6c" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M942 453Q946 450 950 453" fill="none" stroke="#af785c" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M951 476Q967 481 979 475" fill="none" stroke="#e0ac88" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
            {/* Closed, subtly downturned lips: uncertain rather than smiling. */}
            <path d="M947 499Q959 492 973 500" fill="none" stroke="#995e51" strokeWidth="3.3" strokeLinecap="round"/>
            <path d="M953 504Q960 502 967 505" fill="none" stroke="#d49c80" strokeWidth="2.1" strokeLinecap="round"/>
            {/* Glasses sit on the nose bridge, with the temple connected to the ear. */}
            <path d="M843 391L806 415L791 416" stroke="#282c34" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <g clipPath="url(#nearLens)">
              <rect x="844" y="370" width="94" height="77" fill="#acc7dc" opacity="0.08"/>
              <g opacity={reflection}>
                <rect x="844" y="370" width="94" height="77" fill="url(#lens)"/>
                <rect x="844" y="370" width="94" height="77" fill="url(#glassSheen)"/>
                <ellipse cx="891" cy="415" rx="46" ry="30" fill="url(#screenGlow)"/>
                <rect x="859" y="401" width="65" height="26" rx="3" fill="#dbeaff" filter="url(#reflectionBlur)"/>
                <rect x="863" y="405" width="57" height="18" rx="2" fill="#effbff" opacity="0.72" filter="url(#reflectionBlur)"/>
              </g>
            </g>
            <g clipPath="url(#farLens)" opacity={reflection * 0.86}>
              <rect x="954" y="371" width="58" height="71" fill="url(#lens)"/>
              <rect x="964" y="402" width="40" height="22" rx="3" fill="#daeaff" filter="url(#reflectionBlur)"/>
            </g>
            <rect x="844" y="370" width="94" height="77" rx="19" fill="none" stroke="#252a32" strokeWidth="7"/>
            <rect x="954" y="371" width="58" height="71" rx="15" fill="none" stroke="#252a32" strokeWidth="6.5"/>
            <path d="M938 394Q946 388 954 395" fill="none" stroke="#252a32" strokeWidth="6"/>
            <path d="M853 381Q855 376 861 376H918" fill="none" stroke="#727b89" strokeWidth="1.5" opacity="0.48"/>
            </g>
            {/* Near upper arm runs from shoulder to the supported elbow, not across the neck. */}
            <path d="M899 650Q870 642 855 668Q841 693 860 720L997 888Q1021 908 1047 892Q1070 874 1050 845L945 688Q928 661 899 650Z" fill="url(#sleeve)"/>
            <path d="M893 665Q918 670 931 694" fill="none" stroke="#5479a1" strokeWidth="3" opacity="0.45" strokeLinecap="round"/>
            <path d="M1003 839L1048 836Q1066 859 1053 882Q1042 896 1020 891Z" fill="#24446a"/>
            {/* Ulna/radius taper toward wrist; elbow has a rounded supported silhouette. */}
            <path d="M1023 877Q1037 888 1050 874Q1059 865 1053 842L1018 605L981 603L999 832Q1000 860 1023 877Z" fill="url(#skin)"/>
            <path d="M1000 627L1021 840Q1022 858 1031 867" stroke="#d59e76" strokeWidth="3" opacity="0.45" fill="none" strokeLinecap="round"/>
            {/* Closed thinking hand: four folded digits and a distinct opposable thumb. */}
            <path d="M983 613Q970 601 969 583L965 550Q960 535 966 524Q971 517 978 523L981 536L982 515Q984 505 992 508Q999 510 1000 521Q1009 516 1015 523L1021 537Q1029 538 1031 549L1034 578Q1036 598 1019 612Q1004 623 983 613Z" fill="url(#skin)"/>
            <path d="M986 539Q1002 533 1016 541M987 554Q1007 549 1026 558M990 571Q1007 567 1029 575" fill="none" stroke="#c79370" strokeWidth="2.6" strokeLinecap="round"/>
            <path d="M979 586Q987 571 982 555L975 540Q971 532 966 536Q961 541 966 554L970 572" fill="#efc6a0" stroke="#cf9a76" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M988 516L993 516" stroke="#f8dbc0" strokeWidth="4" strokeLinecap="round"/>
          </g>
          {/* Desk covers the lower edge of the supported elbow. */}
          <ellipse cx="1082" cy="903" rx="112" ry="9" fill="#6a4d38" opacity="0.16" filter="url(#softShadow)"/>
          <rect x="940" y="901" width="1120" height="35" rx="5" fill="url(#wood)"/>
          <path d="M961 936H2060V951H961Z" fill="#aa7348"/>
          <path d="M947 906H1920" stroke="#dfb180" strokeWidth="3" opacity="0.65"/>
          {/* A physically joined monitor, rear shell, neck and weighted base. */}
          <path d="M1414 322L1464 310L1487 780L1434 791Z" fill="#202a33"/>
          <path d="M1414 322L1421 325L1441 787L1434 791Z" fill="#536372"/>
          <path d="M1461 313L1468 315L1490 778L1487 780Z" fill="#141c24"/>
          <path d="M1465 732L1490 730L1508 881L1470 885Z" fill="#27323c"/>
          <path d="M1414 884Q1414 876 1427 875H1552Q1566 875 1567 887L1565 898H1416Z" fill="#1e2730"/>
          <path d="M1426 880H1551" stroke="#52606b" strokeWidth="3" strokeLinecap="round"/>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

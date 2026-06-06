---
name: "팀 포털"
description: "Apple에 영감을 받은 미니멀 디자인"
inspiredBy: "Apple.com 디자인 언어"
colors:
  primary: "#0071e3"
  background: "#f5f5f7"
  card: "#ffffff"
  text: "#1d1d1f"
  text-secondary: "#86868b"
  border: "#d2d2d7"
typography:
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
rounded:
  md: 12px
spacing:
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
---

# DESIGN.md

## 개요 (Overview)

Apple.com의 미니멀하고 세련된 디자인 언어를 팀 포털에 적용한다. 넉넉한 여백, 부드러운 라운드, 미묘한 그림자, 그리고 음각 버튼(inset button)이 특징이다.

## 디자인 원칙 (Design Principles)

- **여백은 콘텐츠다:** 충분한 화이트스페이스로 각 요소가 숨 쉴 공간을 만든다.
- **계층 구조:** 명확한 폰트 크기와 두께로 정보의 중요도를 구분한다.
- **미묘한 피드백:** hover/active 시 부드러운 트랜지션으로 상호작용을 전달한다.
- **색은 최소로:** 하나의 포인트 컬러(#0071e3)만 사용하고, 나머지는 흑백 톤으로 처리한다.
- **음각 버튼:** 버튼이 표면에 파묻힌 듯한 inset shadow 효과를 사용한다.

## 토큰 사용 (Token Usage)

- 배경: `#f5f5f7` (Apple 기본 배경)
- 카드: `#ffffff` (흰색 카드, 미묘한 그림자)
- 주요 텍스트: `#1d1d1f` (거의 검정)
- 보조 텍스트: `#86868b` (연한 회색)
- 포인트 컬러: `#0071e3` (Apple 블루)
- 테두리: `#d2d2d7` (매우 연한 회색)
- 카드 radius: 12px
- 버튼 radius: 8px (음각 스타일)

## 컴포넌트 규칙 (Component Rules)

### 카드 (Card)
- 흰색 배경, 12px radius
- `box-shadow: 0 2px 10px rgba(0,0,0,0.04)`
- hover 시 shadow 증가: `0 4px 20px rgba(0,0,0,0.08)`

### 버튼 (Button) - 음각 스타일
- primary: 배경색, 약간 아래로 파묻힌 느낌
- `box-shadow: inset 0 1px 0 rgba(255,255,255,0.3)`
- active 시: `box-shadow: inset 0 2px 4px rgba(0,0,0,0.2)`

### 헤더 (Header)
- 투명 배경, 하단에 얇은 border
- 로고는 왼쪽, 메뉴는 오른쪽
- 고정되지 않음 (스크롤 따라 움직임)

## 해야 할 것과 하지 말 것 (Do's and Don'ts)

- ✅ 충분한 여백 사용
- ✅ 카드에 미묘한 그림자 사용
- ✅ 음각 버튼 스타일 사용
- ❌ 어두운 색상의 큰 영역 사용 금지
- ❌ 불필요한 테두리 사용 금지
- ❌ 여러 색상 사용 금지

## 구현 메모 (Implementation Notes)

- Tailwind CSS variables로 색상 시스템 적용
- shadcn/ui 컴포넌트는 CSS variable override로 스타일 변경
- 폰트: system-ui 스택 (Apple SF Pro 대체)
- 트랜지션: `transition-all duration-200 ease-in-out`

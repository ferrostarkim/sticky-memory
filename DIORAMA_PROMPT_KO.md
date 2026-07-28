# 디오라마 배경 이미지 가이드 (확정)

3D 캠핑 게시판의 **정적 배경 이미지**를 만드는 문서다.
이 이미지 위에 HTML 메모 포스트잇 6개, 하단 큐, 헤더가 겹쳐진다.
"예쁜 그림"이 아니라 **UI가 올라갈 수 있는 그림**이어야 한다.

실제 장소: 会瀬青少年の家 (日立市) — 해변에 면한 건물 + 운동장 + 바다

---

## 0. 확정 상태

**2026-07-28 기준 확정.** 캐릭터가 그려진 정지 이미지 1장을 배경으로 쓴다.

| 항목 | 값 |
| --- | --- |
| 파일 위치 | `public/diorama/camp-island.webp` |
| 원본 크기 | 2752 × 1536 |
| 파일 크기 | 127 KB (원본 PNG 4.6 MB에서 WebP q88로 변환) |
| 생성 도구 | Google Gemini (Nano Banana) |
| 배경색 | 크림 `#f8f0dd` (페이지 배경과 동일) |

변환 명령:

```bash
ffmpeg -i input.png -c:v libwebp -quality 88 -compression_level 6 camp-island.webp
```

> 해상도별 변형(srcset)은 **두지 않는다.** 2752px 원본이 127KB밖에 안 되고,
> srcset을 두면 브라우저가 작은 쪽을 골라 흐려지는 일이 있었다.

### 이미지 안에서 실측한 섬의 윤곽 (좌표 재계산용)

| 기준 | 값 (이미지 대비 %) |
| --- | --- |
| 섬 좌단 | 14% |
| 섬 우단 | 84.5% |
| 섬 상단 | 2.7% |
| 섬 하단 | 94% |

---

## 1. 확정 프롬프트

```text
Isometric 3D miniature diorama of a seaside Christian summer camp on a
floating oval island, cute low-poly clay-toy style, soft matte plastic
and felt materials, ultra-soft global illumination with gentle ambient
occlusion, no harsh shadows.

Soft pastel palette: cream (#f8f0dd), soft lavender (#a58abb), sage
green (#879b68), peach (#dca37f), and a pale turquoise sea (#8fc3c4).

Layout of the island top surface:
- BACK-LEFT: a large cream youth-lodge building with a lavender pyramid
  roof, warm glowing windows and a small wooden porch
- RIGHT SIDE and BACK-RIGHT: a pale sandy beach curving into a calm
  shallow turquoise sea that fills a wide crescent of the island top,
  with a thin white surf line, a small wooden jetty and two tiny rowboats.
  At the island's edge the sea spills over as a soft thin waterfall
  falling into the air below.
- MIDDLE-LEFT: three rounded camping tents in muted pink, sage and dusty
  blue, a small campfire with a warm glow, and a wooden picnic table
- FRONT-CENTER: a wide open sports ground of flat pale grass and packed
  sand, completely empty and clear, with a simple small soccer goal at
  its far LEFT edge only
- EDGES: many lush rounded trees with dense layered foliage clusters,
  forming a full grove along the back edge and the entire left side
- a blank wooden sign board with NO writing on it, near the front-left path
- winding cream footpaths connecting the lodge, the tents and the beach
- the underside of the island is clean bare grey rock, smooth chunky
  low-poly shape, with NO roots and nothing hanging from it

Chibi characters walking on the paths, 1:2 head-to-body ratio, smooth
rounded forms, no facial detail: a gentle figure in a simple cream robe
(no halo, nothing above the head), two small children, a fluffy white
sheep, a small dog. Place them off to the SIDES, never in the middle of
the open sports ground.

Composition: the island sits in the middle of the frame with generous
empty margin above and below. The FRONT-CENTER sports ground must stay
completely clear — no tall objects there at all. All buildings and trees
are placed toward the back and the left/right edges.

Flat solid cream background (#f8f0dd), no sky, no clouds, no gradient.
Top-down 45-degree isometric camera. Extremely high detail, clean,
no text, no letters, no signage words, no watermark, no depth-of-field
blur, no vignette. 16:9 aspect ratio, highest available resolution.
```

### 네거티브 프롬프트

```text
halo, ring above head, glowing ring, roots, hanging roots, vines,
text, letters, words, signage, watermark, logo, realistic human faces,
photorealism, harsh shadows, dark background, night, sky, clouds,
deep blue ocean, big waves, depth of field, blur, vignette, cluttered
foreground, objects in the front-center, noise, grain
```

---

## 2. 구도 제약 — 재생성 시 반드시 지킬 것

코드가 이 구도를 전제로 좌표를 잡고 있다. 구도가 바뀌면
`components/camp/CampDiorama.tsx`의 `PIN_SLOTS`를 다시 맞춰야 한다.

- 섬은 화면 **세로 15%~75%** 안에 위치
- **상단 15%, 하단 20%는 빈 크림 배경** (헤더·큐가 덮음)
- **운동장(앞쪽 중앙)은 완전히 비워둘 것** — 메모 6개가 부채꼴로 놓임
- 바다는 **오른쪽** (왼쪽 하단은 안내문, 오른쪽 하단은 QR이 덮음)
- 건물·나무는 **뒤쪽과 좌우 가장자리**에만

### UI 점유 영역 (데스크톱 1440×900 실측)

| 영역 | 위치 |
| --- | --- |
| 헤더 | 상단 약 14% |
| 큐 리본 | 하단 118px, 좌우 여백 있음 |
| 안내문 | 좌하단 (리본 위로 올림) |
| QR 배너 | 우하단 |
| 메모 6칸 | 운동장 위 부채꼴 |

### 환경 애니메이션(FX)의 앵커 좌표

`globals.css`의 `.camp-fx-*`가 이미지 대비 %로 고정돼 있다. 이미지를 바꾸면
아래를 다시 측정해야 한다. FFmpeg `drawbox`로 위치를 확인하면 빠르다.

| 효과 | selector | 위치 (이미지 대비 %) |
| --- | --- | --- |
| 바다 반짝임 | `.camp-fx-sea` | left 58.5 / top 21.5 / w 25.5 / h 36 |
| 모닥불 | `.camp-fx-fire` | 중심 31 / 49.3 · w 9 |
| 먼지 | `.camp-fx-motes` | 전체 (측정 불필요) |
| 섬 부유 | `.camp-diorama-float` | 전체 (측정 불필요) |

> **줄무늬(`repeating-linear-gradient`)를 물 표현에 쓰지 말 것.**
> 폭포에 적용했더니 흰 실선이 그대로 보여서 제거했다. 물은
> 부드러운 `radial-gradient` 덩어리를 천천히 이동시키는 편이 자연스럽다.

---

## 3. 판정 체크리스트

재생성 시 하나라도 어긋나면 다시 뽑는다.

- [ ] 배경이 단색 크림이고 하늘·구름이 없다
- [ ] **운동장(앞쪽 중앙)이 완전히 비어** 있다
- [ ] 캐릭터가 정중앙에 서 있지 않다
- [ ] 머리 위 후광 링이 없다
- [ ] 섬 밑면에 뿌리가 없다
- [ ] 나무가 풍성하다
- [ ] 바다가 오른쪽에 있고 파스텔 청록이다
- [ ] 글자가 하나도 없다
- [ ] 전체가 선명하다 (블러 없음)

---

## 4. 이미지를 교체할 때의 절차

1. WebP로 변환해 `public/diorama/camp-island.webp`에 덮어쓴다
2. 새 이미지의 **섬 윤곽 %** 를 측정해 위 0번 표를 갱신한다
3. `CampDiorama.tsx`의 `ART_WIDTH` / `ART_HEIGHT`를 실제 크기로 맞춘다
   (비율이 16:9에서 벗어나면 `globals.css`의 `aspect-ratio`도 함께)
4. `PIN_SLOTS` 6개를 새 구도에 맞춰 다시 측정한다
5. `globals.css` 모바일 블록의 2단 좌표(`--pin-mx` / `--pin-my`)도 확인한다
6. `.camp-fx-*` 앵커 좌표를 다시 측정한다

### 좌표 검증 방법

배치를 눈으로 확인하려면 FFmpeg로 포스트잇 위치를 합성해본다.
앵커(발밑) 기준으로 `x = 앵커x% × 폭 − 110`, `y = 앵커y% × 높이 − 255`
(카드 220 × 195, 지주 60 기준).

```bash
ffmpeg -y -i camp-island.webp \
  -vf "drawbox=x=550:y=694:w=220:h=195:color=0xF5D995@0.9:t=fill" check.png
```

브라우저에서는 콘솔로 실측한다. `.camp-diorama-pin .camp-memory-note`의
`getBoundingClientRect()`를 `.camp-memory-ribbon` / `.camp-instructions` /
`.camp-join-desktop`과 비교해 겹치지 않는지 본다.

> CSS를 고쳤는데 화면이 안 바뀌면 Turbopack 캐시를 의심할 것.
> `rm -rf .next` 후 개발 서버 재시작.

---

## 5. 모바일

현재는 데스크톱 이미지를 152% 확대해 상단에 배치하고,
포스트잇 6칸을 **가로 1열이 아니라 2단(안쪽 3 · 앞쪽 3)** 으로
재배치해 대응하고 있다. 390px 폭에 96px 카드 6장은 물리적으로 안 들어간다.

세로 전용 이미지를 만들면 더 좋다. 구도 문단만 교체:

```text
Composition: vertical portrait framing, the island fills the upper two
thirds of the frame, the bottom third is empty cream background.
Top-down 45-degree isometric camera. 3:4 aspect ratio.
```

생성 후 `public/diorama/camp-island-portrait.webp`에 두고
`CampDiorama.tsx`에서 `<picture>`로 분기하면 된다.

---

## 6. 작업 중 밟은 함정 (다음에 또 걸리기 쉬움)

1. **`.camp-shell:not(.camp-shell-spotlight)` 계열 규칙이 더 강하다.**
   `.camp-instructions`의 `bottom`을 아무리 고쳐도 안 먹었는데,
   파일 뒤쪽에 특이성 높은 재정의가 있었다. 위치를 바꿀 때는
   반드시 이쪽을 확인할 것.
2. **인라인 `style`의 커스텀 프로퍼티는 미디어쿼리로 못 덮는다.**
   React가 `--pin-x`를 인라인으로 넣기 때문에, 모바일 재배치는
   별도 변수명(`--pin-mx`)을 쓴다.
3. **개발 서버의 CSS 청크는 파일명에 해시가 없어 브라우저가 캐시한다.**
   고쳤는데 화면이 그대로면 `?cb=` 쿼리를 붙여 다시 로드하거나
   `rm -rf .next` 후 재시작.
4. **`srcset`을 두면 브라우저가 작은 이미지를 골라 흐려질 수 있다.**
   원본이 100KB대라 해상도 변형은 두지 않는다.

---

## 7. 시도했다가 접은 것 — 움직이는 캐릭터

캐릭터를 걷게 만드는 시도를 두 방식으로 했고, 둘 다 채택하지 않았다.
같은 길을 다시 파기 전에 읽을 것.

### 1차: 2D 스프라이트 이동

이미지에서 캐릭터를 오려내 배경 위에서 좌표를 옮기는 방식.

- **결과: 실패.** 평면 컷아웃은 다리를 움직일 수 없어 통째로 미끄러지며
  통통 튀기만 한다. 정지 화면보다 조악해 보였다.
- 정지 이미지에는 깊이 정보가 없어 건물 뒤로 돌아가는 표현도 불가능하다.

### 2차: 로컬 생성 3D 모델

TripoSR(오픈소스)을 로컬에 설치해 컷아웃 5장을 3D 모델로 변환하고,
Blender로 뼈대를 넣어 걷기 애니메이션을 만들어 Three.js로 띄웠다.

- 기술적으로는 전부 동작했다. 다리 교차, 팔 반대 스윙, 네발 동물의 속보,
  진행 방향 회전, 깊이 정렬까지 구현됨.
- **결과: 채택 안 함.** 걷는다기보다 "회전하며 이동하는" 느낌이 강해
  레퍼런스 영상 수준의 자연스러움에 못 미쳤다. 용량도 5명에 3.3MB로 무거웠다.

**결론: 정지 이미지 + 환경 애니메이션(섬 부유·모닥불·바다·먼지)로 확정.**
캐릭터의 움직임이 정말 필요하다면, 코드로 만드는 대신
**애니메이션이 포함된 상용 3D 캐릭터 에셋**을 구하는 편이 현실적이다.

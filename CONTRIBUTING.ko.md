[English](./CONTRIBUTING.md)

# Contributing Guidelines

caver-js 컨트리뷰팅 관심에 감사드립니다. caver-js는 오픈소스프로젝트로, 개발자 분들의 의견과 컨트리뷰팅을 언제라도 환영합니다. 아래 가이드라인을 읽고 따라 주시기를 요청합니다.

## How to Contribute

1. [contributing document](./CONTRIBUTING.md)를 읽어 주세요.
2. [Contributor Licensing Agreement (CLA)](#contributor-license-agreement-cla)에 서명해 주세요.
3. 적절한 [라벨(labeling)](#usage-of-labels)을 붙여 이슈를 등록 해 주세요.
4. 라벨이 `contribution welcome`으로 변경될때 까지 기다려 주세요.
5. 라벨이 `contribution welcome`으로 변경된 후, 작업을 시작 해 주세요. 다른 개발자와 중복 작업이 발생하지 않도록,이슈에 커멘트를 남겨 업데이트 해 주세요.
6. 풀리퀘스트(PR) 하기전엔, 모든 코드에 대한 테스트케이스를 확인 해 주세요. 충분한 테스트케이스를 포함 해 주기를 요청드립니다. PR 을 요청 한 후, 코드리뷰 및 승인 을 기다려 주세요. 리뷰어들이 추가 작업이나 수정건에대해 커밋 요청이 있을 수 있습니다.
7. 작업건이 승인된 후, PR은 담당자에의해 병합됩니다.
8. PR이 병합된 후, PR은 관리자에 의해 close 됩니다. 이후에 불필요한 브랜치는 삭제 가능 합니다.

## Types of Contribution
다양한 컨트리뷰트 방법이 있습니다. 각 컨트리뷰트 프로세스에 관한 가이드라인을 읽어 주세요.

-   [Issues and Bugs](#issues-and-bugs)
-   [Feature Requests](#feature-requests)
-   [Code Contribution](#code-contribution)

### Issues and Bugs

caver-js 의 버그나 이슈를 발견하는 경우, [이슈를 등록](https://github.com/klaytn/caver-js/issues) 해 주세요. 이슈를 등록하기 전 아래 항목을 우선 확인 해 주세요:

- 중복된 이슈가 아닌지.
- caver-js 의 최신버전에서 까지 개선된 이슈가 아닌지. 개인 지원이 필요한 경우에는 developer@klaytn.com 로 메일 부탁드립니다.

버그를 알리고 싶은경우, 아래 내용을 포함 해 주세요.
- 버그 재현 과정.
- 최대한 명확하고 정확한 설명.
- 코드나 스크린샷 등 이 매우 중요합니다.

위의 내용을 충족하는지 확인 후, [이슈를 등록](https://github.com/klaytn/caver-js/issues)해 주세요. 이슈를 분류하기위해 [라벨](#usage-of-labels) 을 달아 주세요.

### Feature Requests

[Issues]](https://github.com/klaytn/caver-js/issues) 에서 새로운 기능이나 개선을 요청 할 수 있습니다. 이슈 링크가 없는 컨트리뷰팅은 허용되지 않습니다. Klaytn 커뮤니티가 아이디어를 완전히 이해하고 토론 할 수 있도록, 이슈를 먼저 등록 해 주세요. 이 경우에도 [라벨](#usage-of-labels) 을 달아 주세요.

#### Usage of Labels

이용가능한 라벨 목록:

이슈를 우선 구분하기 위한 라벨:

- issue/bug: 코드레벨의 버그.
- issue/documentation: 문서 관련 이슈.
- issue/enhancement: 개선 관련 이슈.

open 상태인 이슈 (관리자에 의해 라벨이 달리게 됩니다.):

- (no label): 기본상태.
- open/need more information : 이슈 생성자에게 추가적인 설명을 요청하는 상태.
- open/reviewing: 이슈를 리뷰중인 상태.
- open/re-label needed: `bug` 또는 향후 `enhancement` 와 같은 확인 상태로 라벨이 변경되어야 함.
- open/approved: 수정되어야할 `bug` 또는 개발되어야 할 `enhancement` 로 이슈가 확인 된 상태.
- open/contribution welcome: 수정 또는 개선 제안이 승인되어 컨트리뷰팅 작업 가능한 상태.

closed 상태인 이슈:

- closed/fixed: 이슈에 대한 수정이 제안된 상태.
- closed/duplicate: 해당 이슈는 다른 이슈로 보고되어 관리되고 있는상태.
- closed/invalid: 재현할 수 없는 이슈.
- closed/reject: 리뷰 후 작업 거부된 이슈.

### Code Contribution

코딩 스타일 및 품질 요구 사항을 따라 주세요. 코드를 제출할시 가능한한 코딩스타일을 최대한 따라 주시길 요청합니다. 네이밍 규칙, 서식 규칙등에 유의해 주세요.

JavaScript의 코딩 스타일에 대해서는 다음 웹 사이트를 참고 해 주세요.
- https://www.w3schools.com/js/js_conventions.asp
- https://google.github.io/styleguide/jsguide.html

caver-js는 prettier을 포함한 eslint가 적용되어있습니다. 린팅 규칭은 에어비앤비를 따릅니다.

풀리퀘스트를 요청하기 전에, `npm run lint` 를 실행하여 확인되는 이슈를 수정 해 주세요.
그렇지 않은경우, CircleCI 에서의 테스트는 실패하고, 코드는 병합 되지 못합니다.

포맷에러는 `npm run lintFix` 명령어를 이용하여 쉽게 수정가능 합니다.

## Contributor License Agreement (CLA)

풀리퀘스트를 요청할 시, 법적인 문제로 [CLA-Assistant](https://cla-assistant.io/klaytn/caver-js) 를 통해 CLA 에 서명해야 함을 명심해 주세요. 개인 또는 법인으로 CLA에 한 번만 서명해야합니다.

최초 풀리퀘스트를 요청할시 CLA Assistant(봇) 에 의해 계약에 서명하라는 메시지가 표시됩니다.

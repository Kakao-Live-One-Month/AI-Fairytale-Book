// 채팅 메시지를 표시할 DOM
const chatMessages = document.querySelector('#chat-messages');
// 사용자 입력 필드
const userInput = document.querySelector('#user-input input');
// 전송 버튼
const sendButton = document.querySelector('#user-input button');
// OpenAI API 엔드포인트 주소를 변수로 저장
const apiEndpoint = 'https://api.openai.com/v1/chat/completions';

// 발급받은 OpenAI API 키를 변수로 저장
let apiKey;

fetch('application-secret.json')
    .then(response => response.json())
    .then(data => {
        apiKey = data.OPENAI_API_KEY;
        console.log(apiKey);
    })
    .catch(error => console.error('Error loading application-secret.json', error));

// GPT에 요청 보낼 기본 프롬프트 
const defaultPrompt = `너는 동화책 작가로, 키워드를 입력받으면 해당 키워드와 관련된 동화 이야기를 생성해야 해. `
                    + `각 문단이 끝날 때마다 방금 끝난 문단을 분석하여 해당 문단에 어울리는 이미지 생성을 위한 프롬프트도 추가해야 해. `
                    + `첫 문단부터 마지막 문단까지. [샘플 이야기 문단] [이야기 문단의 프롬프트]. `


function addMessage(image, story) {
    // console.log(image);
    // console.log(story);

    // 키워드 입력 시 키워드를 메시지로 출력 
    if (!image) {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        messageContainer.textContent = "키워드: " + story;
        // 채팅 메시지 목록에 새로운 메시지 컨테이너 추가
        chatMessages.prepend(messageContainer);
        return;
    }

    // 메시지 컨테이너 생성 
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';

    // 메시지 컨테이너의 좌측 요소에 이미지 삽입 
    const leftMessageElement = document.createElement('div');
    leftMessageElement.className = 'message-image';
    leftMessageElement.textContent = image;

    // 메시지 컨테이너의 우측 요소에 스토리 삽입 
    const rightMessageElement = document.createElement('div');
    rightMessageElement.className = 'message-story';
    rightMessageElement.textContent = story;

    // 메시지 컨테이너에 image와 story 추가
    messageContainer.appendChild(leftMessageElement);
    messageContainer.appendChild(rightMessageElement);

    // 채팅 메시지 목록에 새로운 메시지 컨테이너 추가
    chatMessages.prepend(messageContainer);
}

// ChatGPT API 요청
async function fetchAIResponse(prompt, tokens) {
    console.log(prompt);
    // API 요청에 사용할 옵션을 정의
    const requestOptions = {
        method: 'POST',
        // API 요청의 헤더를 설정
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",  // 사용할 AI 모델
            messages: [
                {
                    role: "user", // 메시지 역할을 user로 설정
                    content: prompt // 사용자가 입력한 메시지
                }, 
            ],
            temperature: 0.6, // 모델의 출력 다양성
            max_tokens: tokens, // 응답받을 메시지 최대 토큰(단어) 수 설정
            top_p: 1, // 토큰 샘플링 확률을 설정
            frequency_penalty: 0.5, // 일반적으로 나오지 않는 단어를 억제하는 정도
            presence_penalty: 0.5, // 동일한 단어나 구문이 반복되는 것을 억제하는 정도
            stop: ["Human"], // 생성된 텍스트에서 종료 구문을 설정
        }),
    };
    // API 요청후 응답 처리
    try {
        const response = await fetch(apiEndpoint, requestOptions);
    
        if (!response.ok) {
            throw new Error(`OpenAI API 호출이 실패했습니다. 응답 코드: ${response.status}`);
        }
    
        const data = await response.json();
    
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error('올바른 형식의 API 응답이 아닙니다.');
        }
    
        const aiResponse = data.choices[0].message.content;
        console.log(aiResponse);
        return aiResponse;
    } catch (error) {
        console.error('OpenAI API 호출 중 오류 발생:', error.message);
        return 'OpenAI API 호출 중 오류 발생';
    }
}

// 전송 버튼 클릭 이벤트 처리
sendButton.addEventListener('click', async () => {
    // 사용자가 입력한 메시지
    const keyword = userInput.value.trim();
    const storyPrompt = defaultPrompt + `키워드: ${keyword}`;
    const tokens = 1024;

    // 메시지가 비어있으면 리턴
    if (keyword.length === 0) return;

    // 사용자 메시지 화면에 추가
    addMessage('', keyword);
    userInput.value = '';

    //ChatGPT API 요청후 답변을 화면에 추가
    const aiResponse = await fetchAIResponse(storyPrompt, tokens);

    // '\n'로 문단을 분리하고 각 문단에 대해 처리
    const paragraphs = aiResponse.split('\n');

    const storyAndImageList = []

    paragraphs.forEach(paragraph => {
        if (!paragraph.trim()) {
            return;
        }

        storyAndImageList.push(paragraph);
    });

    storyAndImageList.forEach((_, index) => {
        if (index % 2 === 1) {
            // console.log("image: " + storyAndImageList[index]);
            // console.log("story: " + storyAndImageList[index-1]);
            addMessage(storyAndImageList[index], storyAndImageList[index - 1]);
        }
    });
    
});

// 사용자 입력 필드에서 Enter 키 이벤트를 처리
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

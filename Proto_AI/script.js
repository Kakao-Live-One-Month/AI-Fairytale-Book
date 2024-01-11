document.getElementById('generateButton').addEventListener('click', function () {
    const promptText = document.getElementById('prompt').value
  
    axios
      .post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: promptText,
          model: "dall-e-3",
          n: 1,
          size: '1024x1024',
        },
        {
          headers: {
            Authorization: `Bearer ${'OPEN AI API 키 값 넣기'}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        const imageUrl = response.data.data[0].url
        document.getElementById('resultImage').src = imageUrl
        console.log(imageUrl)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  })
  
// Mesh

//predictions : mảng chứa vị trí khuôn mặt topLeft và bottomRight
//emotions : đối tượng chứa các cảm xúc dự đoán đc backend trả về
//ctx : đối tượng canvas context,  dùng để vẽ hình ảnh.
export const drawMesh = (predictions, emotions, ctx) => {
    var emo = emotions['emotion']
    // Kiểm tra xem có phát hiện khuôn mặt nào không
    if (predictions.length > 0) {
        //Xác Định Vị Trí và Kích Thước của Bounding Box
        for (let i = 0; i < predictions.length; i++) {
            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
      
            ctx.beginPath();
            ctx.lineWidth = "3";
            if (emo==='angry'){
              ctx.fillStyle = 'red';
            }
            else if (emo==='neutral'){
              ctx.fillStyle = 'green';
            }
            else if (emo==='happy'){
              ctx.fillStyle = 'orange';
            }
            else if (emo==='fear'){
              ctx.fillStyle = 'blue';
            }
            else if (emo==='surprise'){
              ctx.fillStyle = 'yellow';
            }
            else if (emo==='sad'){
              ctx.fillStyle = 'gray';
            }
            else {
              ctx.fillStyle = 'pink';
            }
            ctx.globalAlpha = 0.2; // độ trong của hình chữ nhật

            // Vẽ Hình Chữ Nhật Trên Canvas
            ctx.rect(start[0], start[1], size[0], size[1]);
            ctx.fillRect(start[0], start[1], size[0], size[1]);
            ctx.stroke();
            //Vẽ Nhãn Cảm Xúc
            ctx.font="20px Georgia";
            ctx.textAlign="center"; 
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#000000";
            ctx.fillText(emo, start[0]+40, start[1]+15);
          }
      }
    };
function calculateElo(rating1,rating2,winner){
    const e=1/(1+10**((rating2-rating1)/400));
    let newRating1;
    let newRating2;
    const K=32;
    
       
        if(winner==1){
            newRating1=rating1+K*(1-e);
            newRating2=rating2+k*(e-1);
        }else{
             newRating1=rating1+K*(0-e);
            newRating2=rating2+k*(e);

        }

    
    
    return {newRating1,newRating2};


}

module.exports=calculateElo;
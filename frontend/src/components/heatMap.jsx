import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../../heatmap.css'



export default function ActivityHeatmap({startDate,activity}){
    

    return(
        <div>
            <CalendarHeatmap
            startDate={startDate}
            endDate={new Date()}
            values={activity}
            classForValue={(value) => {
            if (!value) {
                  return 'color-empty';
            }
            else if(value.count<3){
                 return `color-scale-1`;
            }
            else if(value.count<6&&value.count>=3){
                 return `color-scale-2`;
            }
            else if(value.count<9&&value.count>=6){
                return `color-scale-3`
            }
            else{
                return 'color-scale-4'
            }

            
  }}
/>

        </div>
        
    )

}
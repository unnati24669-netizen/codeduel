import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis,ResponsiveContainer } from 'recharts';




export default function IndexLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" aspect={1.618}>
       <LineChart data={data}>

       
      <CartesianGrid strokeDasharray="5 5" />
      <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()}/>
      <YAxis />
      <Line type="monotone" dataKey="rating" />
     
      <Legend position="insideTopRight" offset={20} />
     
    </LineChart>
    
      
</ResponsiveContainer>
    
  );
}
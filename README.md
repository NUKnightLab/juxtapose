#JuxtaposeJS keyboard accessibility fork

JuxtaposeJS is a simple open source tool for creating before/after image sliders. I have created a fork to add keyboard accessibility to the sliders: 

It applies the role of <code>slider</code> to <code>div.jx-controller</code>, gives tabindices to the components of the slider that should receive keyboard focus,
and applies the following WAI-ARIA roles to the slider: 

<ul>
	<li>aria-valuenow</li>
	<li>aria-valuemin</li>
	<li>aria-valuemax</li>
</ul>

In juxtapose.css, this fork adds :focus styling for components of the slider to ensure the focus states have adequate colour contrast. 
In example.html alt text is added to each image

##To-do
<ul>
	<li>The present focus order gives the slider controller (jx-controller) focus, followed by the left and right buttons. To someone navigating with a keyboard
	a more sequential order (left button, jx-controller, right button) would probably be more logical.</li>
	<li>The "Create a Juxtapose slider" functionality at <a href="http://juxtapose.knightlab.com/">Juxtapose.Knightlab.com</a> should provide a means for the end
	user to add alternative text to both images</li>
 </ul>